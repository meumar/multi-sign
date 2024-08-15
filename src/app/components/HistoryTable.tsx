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
import { Chip } from "@nextui-org/chip";

interface TransactionsProps {
  rows: any[];
  label: string;
  columns: any[];
}

const TableTransactions: React.FC<TransactionsProps> = ({
  rows,
  label,
  columns,
}) => {
  const renderCell = React.useCallback((user: any, columnKey: any) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "amount":
        return (
          <Chip
            className="capitalize"
            color={cellValue > 0 ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      default:
        return <p className="text-gray-100"> {cellValue} </p>;
    }
  }, []);

  return (
    <div>
      <Table
        aria-label="Example table with dynamic content"
        removeWrapper
        selectionMode="none"
        className="bg-slate-800 rounded-lg p-5"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              className="bg-slate-900 text-gray-100 text-xl"
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={rows} emptyContent={"No data"}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableTransactions;
