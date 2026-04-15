import { useReactTable, getFilteredRowModel, getCoreRowModel, flexRender, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table'
import { useState } from 'react';

//a


//const data = [{ id: 1, name: 'Ada' }]
const columns = [{ accessorKey: 'correo', header: 'Correo' }, { accessorKey: 'codigoPedido', header: 'codigo de pedido' }, { accessorKey: 'sent', header: 'Enviado' }, { accessorKey: 'createdAt', header: 'fecha de creacion' }, { accessorKey: 'telephone', header: 'Telefono' }]

export default function SimpleTable({ data }) {
  const [globalFilter, setGlobalFilter] = useState<any>([])
  const table = useReactTable({
    data, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), state: { globalFilter, }, onGlobalFilterChange: setGlobalFilter, getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  })

  return (
    <div class="w-full text-center" >

      <input id="textoBuscar"
        type="text"
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="p-2 font-lg shadow border border-block"
        placeholder="Search all columns..."
      />

      <table class="border-solid border-gray-200 w-9/10 mx-auto ">
        <thead class="bg-gray-200">
          {table.getHeaderGroups().map((hg) => (
            <tr id={hg.id} key={hg.id} >
              {hg.headers.map((header) => (
                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr id={row.original.id} key={row.id} data-carrito={row.original.cart} class="border-y-solid border border-gray-200 *:py-3 hover:bg-red-300">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>


      </table>

      <div class="flex text-center justify-center gap-4">
        <button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>

    </div>


  )
}


