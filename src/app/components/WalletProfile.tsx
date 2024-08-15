import CircleText from "./UI/Circle";

const WalletProfile = (walletDetails: any) => {
  return (
    <main>
      <div className="p-5">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <CircleText text={walletDetails.name} color="red" size={126} />
        </div>
        <div className="text-gray-300 text-sm text-center mt-3">
          {walletDetails.balance} SOL
        </div>
      </div>
    </main>
  );
};

export default WalletProfile;
