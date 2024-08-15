import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/table";

interface TransactionsProps {
  history: any[];
}

const WalletSignTransactions: React.FC<TransactionsProps> = ({ history }) => {
  return (
    <Table>
      <TableHeader>
        <TableColumn key="signer">User</TableColumn>
        <TableColumn key="timestamp">Timestamp</TableColumn>
      </TableHeader>
      <TableBody items={history}>
        {(item) => (
          <TableRow key={item.transaction_signature_address}>
            {(columnKey) => (
              <TableCell className="text-slate-400">
                <p className="truncate">{getKeyValue(item, columnKey)}</p>
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default WalletSignTransactions;
