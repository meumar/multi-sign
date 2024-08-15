use anchor_lang::prelude::*;

declare_id!("9XXmc9PaoKTqSGW1YgxTCPzmQRFDRBxnGGjXnwZWCK8m");

#[program]
mod hello_anchor {
    use super::*;
    //Create program wallet
    pub fn create_multi_sign_wallet(
        ctx: Context<CreateWallet>,
        name: String,
        threshold: u64,
        users: [Pubkey; 5],
    ) -> Result<()> {
        if users.len() < 5 {
            return err!(WalletError::InvalidUsers);
        }
        // Wallet Initialization
        let account_data = &mut ctx.accounts.wallet_account;
        account_data.created_by = *ctx.accounts.signer.key;
        account_data.threshold = threshold;
        account_data.name = name.clone();
        account_data.user_1 = users[0].key();
        account_data.user_2 = users[1].key();
        account_data.user_3 = users[2].key();
        account_data.user_4 = users[3].key();
        account_data.user_5 = users[4].key();
        account_data.is_transaction = false;
        msg!("Multi-sign wallet created, {}, {}", name, threshold);
        Ok(())
    }

    pub fn create_multi_sign_transaction(
        ctx: Context<CreateWalletTransaction>,
        name: String,
        amount: u64,
    ) -> Result<()> {
        // Wallet Initialization
        let wallet_account_data = &mut ctx.accounts.wallet_account;
        let account_data = &mut ctx.accounts.transaction_account;
        let users = [
            wallet_account_data.user_1,
            wallet_account_data.user_2,
            wallet_account_data.user_3,
            wallet_account_data.user_4,
            wallet_account_data.user_5,
        ];

        let valid_user = users
            .iter()
            .any(|x| x.to_string() == *ctx.accounts.signer.key.to_string());
        if !valid_user {
            account_data.status = 1;
            return err!(WalletError::InvalidUser);
        }
        let balance = wallet_account_data.to_account_info().lamports();

        if balance < amount {
            account_data.status = 2;
            return err!(WalletError::InsufficientBalance);
        }
        let threshold = wallet_account_data.threshold;
        account_data.is_transaction = true;
        account_data.created_by = *ctx.accounts.signer.key;
        account_data.reciever = *ctx.accounts.reciever.key;
        account_data.name = name.clone();
        account_data.amount = amount;
        account_data.completed_signers = 0;
        account_data.threshold = threshold;
        account_data.wallet_account = ctx.accounts.wallet_account.key();
        let clock = Clock::get()?;
        account_data.timestamp = clock.unix_timestamp as u64;
        account_data.status = 3;
        Ok(())
    }

    pub fn create_sign_account(ctx: Context<CreateSignatureAccount>, _bump: u8) -> Result<()> {
        msg!("Transaction signature created");
        let wallet_account_data = &mut ctx.accounts.wallet_account;
        let transaction_account = &mut ctx.accounts.transaction_account;
        let account_data = &mut ctx.accounts.transaction_signature_account;
        let users = [
            wallet_account_data.user_1,
            wallet_account_data.user_2,
            wallet_account_data.user_3,
            wallet_account_data.user_4,
            wallet_account_data.user_5,
        ];
        let valid_user = users
            .iter()
            .any(|x| x.to_string() == *ctx.accounts.signer.key.to_string());
        if !valid_user {
            transaction_account.status = 1;
            return err!(WalletError::InvalidUser);
        }
        account_data.wallet_account = wallet_account_data.key();
        account_data.transaction_account = transaction_account.key();
        account_data.signer = *ctx.accounts.signer.key;
        let clock = Clock::get()?;
        account_data.timestamp = clock.unix_timestamp as u64;

        transaction_account.completed_signers = transaction_account.completed_signers + 1;

        if transaction_account.completed_signers >= transaction_account.threshold {
            let reciever = transaction_account.reciever;
            let amount = transaction_account.amount;

            if reciever != *ctx.accounts.reciever.key {
                return err!(WalletError::InvalidProgramUser);
            }
            msg!("Amount transfer is {}", amount);

            **ctx
                .accounts
                .wallet_account
                .to_account_info()
                .try_borrow_mut_lamports()? -= amount;
            **ctx
                .accounts
                .reciever
                .to_account_info()
                .try_borrow_mut_lamports()? += amount;

            transaction_account.status = 4;
        }

        Ok(())
    }

    // pub fn close_pda_account(_ctx: Context<ClosePdaAccount>) -> Result<()> {
    //     msg!("Accounts closed");
    //     Ok(())
    // }

}

#[derive(Accounts)]
#[instruction(name: String, threshold: u64, users: [Pubkey; 5])]
pub struct CreateWallet<'info> {
    #[account(init, payer = signer, seeds=[b"multisigwallet".as_ref(), signer.key().as_ref(), name.as_ref()], bump, space = 8 + WalletAccount::INIT_SPACE + 8)]
    pub wallet_account: Account<'info, WalletAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct WalletAccount {
    pub is_transaction: bool,
    pub created_by: Pubkey,
    pub threshold: u64,
    #[max_len(32)]
    pub name: String,
    pub user_1: Pubkey,
    pub user_2: Pubkey,
    pub user_3: Pubkey,
    pub user_4: Pubkey,
    pub user_5: Pubkey,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateWalletTransaction<'info> {
    #[account(init, payer = signer, seeds=[b"multisigntransaction".as_ref(), wallet_account.key().as_ref(), signer.key().as_ref(), reciever.key().as_ref(), name.as_ref()], bump, space = 8 + TransactionAccount::INIT_SPACE+32+8)]
    pub transaction_account: Account<'info, TransactionAccount>,

    #[account(mut)]
    pub wallet_account: Account<'info, WalletAccount>,

    pub reciever: AccountInfo<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TransactionAccount {
    pub is_transaction: bool,
    pub wallet_account: Pubkey,
    pub created_by: Pubkey,
    pub threshold: u64,
    pub reciever: Pubkey,
    pub completed_signers: u64,
    pub timestamp: u64,
    pub amount: u64,
    pub status: u8,
    #[max_len(32)]
    pub name: String,
}

#[derive(Accounts)]
pub struct CreateSignatureAccount<'info> {
    #[account(init, payer = signer, seeds=[b"transactionsignature".as_ref(), wallet_account.key().as_ref(), transaction_account.key().as_ref(), signer.key().as_ref(),], bump, space = 8 + TransactionSignature::INIT_SPACE+32+8)]
    pub transaction_signature_account: Account<'info, TransactionSignature>,
    #[account(mut)]
    pub wallet_account: Account<'info, WalletAccount>,
    #[account(mut)]
    pub transaction_account: Account<'info, TransactionAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub reciever: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TransactionSignature {
    pub transaction_account: Pubkey,
    pub wallet_account: Pubkey,
    pub signer: Pubkey,
    pub timestamp: u64,
}

#[derive(Accounts)]
pub struct ClosePdaAccount<'info> {
    #[account(mut, close = recipient)]
    pub wallet_account: Account<'info, WalletAccount>,
    #[account(mut, close = recipient)]
    pub transaction_account: Account<'info, TransactionAccount>,
    #[account(mut, close = recipient)]
    pub transaction_signature_account: Account<'info, TransactionSignature>,
    #[account(mut)]
    pub recipient: Signer<'info>,
}

//Error messages
#[error_code]
pub enum WalletError {
    #[msg("INVALID_RECIVER: Invalid program user")]
    InvalidProgramUser,
    #[msg("INVALID_USER: It's not your turn")]
    InvalidUser,
    #[msg("INVALID_INSUFFICIENT_BALANCE: Wallet doesn't have enough balance to transfer")]
    InsufficientBalance,
    #[msg("INVALID_USERS: Invalid number of users")]
    InvalidUsers,
}
