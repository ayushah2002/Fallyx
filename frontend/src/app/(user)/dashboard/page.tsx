"use client";

import { useRouter } from "next/navigation";
import Image from "next/image"
import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody, Button } from "@mui/material";
import toast from 'react-hot-toast';
import { useState, useEffect } from "react";
import useFireBaseAuth from "@/hooks/useFirebaseAuth";

type Log = {
    id: string;
    userId: string;
    type: string;
    createdAt: string;
    updatedAt: string;
}

const Dashboard = () => {
    const router = useRouter();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(false);
    const { user, isLoading } = useFireBaseAuth();
    console.log("user: ", user)
    
    useEffect(() => {
        if (isLoading) return;
        if(!user) {
            toast.error("Not logged in");
            return;
        }

        const getLogs = async() => {
            setLoading(true);

            try {
                if(!user) {
                    toast.error("Error authorizing user");
                    return;
                }
                const token = await user.getIdToken();
                const result = await fetch("http://localhost:4000/incidents", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                });

                const data = await result.json();

                if (!data || data.error) {
                    console.log(data);
                    toast.error("Error getting incidents");
                    return;
                }
                setLogs(
                    data.sort(
                      (a: Log, b: Log) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    )
                  );                  
            } catch (error) {
                console.log(error);
                toast.error("Error retrieving incidents");
            } finally {
                setLoading(false);
            }
        }
        getLogs();
    }, [user, isLoading]);

    const handleClick = () => {
        router.push("/create")
    }

    const handleViewIncident = (id: string) => {
        router.push(`/view?id=${id}`);
    }

    const columns = [
        {id: 'id', label: 'ID'},
        {id: 'userId', label: 'User ID'},
        {id: 'type', label: 'Type'},
        {id: 'createdAt', label: 'Created'},
        {id: 'updatedAt', label: 'Updated'},
        {id: 'view', label: 'View'}
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

                <div className="flex items-center space-x-2">
                    <Image 
                        src="/medical-logo.png" 
                        alt="medical logo"
                        width={175}
                        height={175} 
                    />
                </div>
            </div>
            <div className='container'>
                <div className="heading space-x-2 bg-emerald-300">
                    <div className="m-1 p-1">
                        <button onClick={handleClick}> Create an Inicident </button>
                    </div>

                    <div className="p-4 m-4">
                        <input
                            type="text"
                            disabled
                            placeholder="Search logs..."
                        />
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
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && logs.length === 0 && (
                                <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                            )}

                            {!loading && logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell align="center">{log.id}</TableCell>
                                    <TableCell align="center">{log.userId}</TableCell>
                                    <TableCell align="center">{log.type}</TableCell>
                                    <TableCell align="center">{new Date(log.createdAt).toLocaleString()}</TableCell>
                                    <TableCell align="center">{new Date(log.updatedAt).toLocaleString()}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleViewIncident(log.id)}
                                        >
                                            View Incident
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}

export default Dashboard