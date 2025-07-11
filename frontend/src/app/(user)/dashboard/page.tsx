"use client";

import { useRouter } from "next/navigation";
import Image from "next/image"
import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody } from "@mui/material";


const Dashboard = () => {
    const router = useRouter();
    
    const handleClick = () => {
        router.push("/create")
    }

    const columns = [
        {id: 'id', label: 'ID'},
        {id: 'userId', label: 'User ID'},
        {id: 'type', label: 'Type'},
        {id: 'createdAt', label: 'Created'},
        {id: 'updatedAt', label: 'Updated'}
    ];

    return (
        <div className='container'>
            <div className="heading p-4 m-4">
                <div className="flex items-center space-x-2">
                    <Image 
                        src="/fallyx-logo.png" 
                        alt="fallyx logo"
                        width={75}
                        height={75} 
                    />
                    <span className="font-bold">
                        Fallyx
                    </span>
                </div>

                <span className='text-green-700 font-medium'>
                    Medical Logging Table
                </span>

                <div>
                    temp
                </div>
            </div>
            <div className='container'>
                <div className="heading space-x-2 bg-amber-50">
                    <div className="p-4 m-4">
                        <input
                            type="text"
                            placeholder="Search logs..."
                        />
                    </div>
                    <div className="m-1 p-1">
                        <button onClick={handleClick}> Create an Inicident </button>
                    </div>
                </div>
                
                <TableContainer>
                    <Table stickyHeader aria-label="table of logs">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.id} align="center">
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            <TableRow>
                                <TableCell>hi</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}

export default Dashboard