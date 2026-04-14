import { useReactTable, getFilteredRowModel, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { useState } from 'react';

//a


//const data = [{ id: 1, name: 'Ada' }]
const columns = [{ accessorKey: 'correo', header: 'Correo' }, { accessorKey: 'codigoPedido', header: 'codigo de pedido' }, { accessorKey: 'sent', header: 'Enviado' }, { accessorKey: 'createdAt', header: 'fecha de creacion' }, { accessorKey: 'telephone', header: 'Telefono' }]

export default function SimpleTable({data}) {
    const [globalFilter, setGlobalFilter] = useState<any>([])
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), state: {globalFilter,},  onGlobalFilterChange: setGlobalFilter })

    return (
        <div class="w-full text-center" >

        <input id="textoBuscar"
            type="text"
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="p-2 font-lg shadow border border-block"
            placeholder="Search all columns..."
        />

        <table class="w-full text-center">
        <thead>
            {table.getHeaderGroups().map((hg) => (
            <tr id={hg.id} key={hg.id}>
                {hg.headers.map((header) => (
                <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
                ))}
            </tr>
            ))}
        </thead>
        <tbody>
            {table.getRowModel().rows.map((row) => (
            <tr id={row.original.id} key={row.id} data-carrito={row.original.cart}>
                {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
                ))}
            </tr>
            ))}
        </tbody>

            
        </table>


    </div>


  )
}
