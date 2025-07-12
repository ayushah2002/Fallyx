"use client"

import useFireBaseAuth from "@/hooks/useFirebaseAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast'

const CreateIncident = () => {
    const router = useRouter();
    
    const [id, setId] = useState("");
    const [userId, setUserId] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [summary, setSummary] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
 
    const { user } = useFireBaseAuth();
    useEffect(() => {
        if (user?.uid) {
            setUserId(user.uid);
        }
        // const random = crypto.randomUUID().slice(0, 8);
        const random = Math.floor(100000 + Math.random() * 900000).toString();
        setId(random)
    }, [user]);

    const handleCreateIncident = async(e: React.FormEvent) => {
        e.preventDefault();
        try {
            if(!user) {
                setResult("User not authenticated");
                setIsError(true);
                toast.error("Error creating incident");
                return;
            }

            const token = await user.getIdToken();
            const result = await fetch("http://localhost:4000/incidents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id,
                    userId,
                    type,
                    description,
                    summary,
                })
            })

            const data = await result.json();

            if (!data || data.error) {
                console.log(data);
                setResult(`Error: ${data.message}`);
                setIsError(true);
                toast.error("Error creating incident");
                return;
            }
            console.log("Incident created for ", data);
            toast.success("Incident Created Successfully!");

        } catch (error) {
            console.log(error);
            toast.error("Error creating incident");
            setResult("Error creating incident");
            setIsError(true);
        }
    }

    const handleBackButton = () => {
        router.push("/dashboard");
    }
    
    return (
        <div className="container justify-center"> 
            <form onSubmit={handleCreateIncident} className="space-y-4">
                <div className="flex justify-center font-bold text-2xl">
                    Incident Create
                </div>
                <div>
                    <label className='font-medium text-sm'> 
                        ID 
                        <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input 
                        value={id} 
                        readOnly 
                        className="bg-gray-200"
                    />
                </div>

                <div>
                <label className="font-medium text-sm">
                    Type
                    <span className="text-red-500 ml-0.5">*</span>
                </label>
                    <input value={type} onChange={e => setType(e.target.value)}/>
                </div>

                {/* <div className='flex pt-2'>
                    <label className="pt-2 pr-2 pb-2"> Created </label>
                    <input 
                        value={createdAt} 
                        onChange={e => setCreatedAt(e.target.value)}
                        className='w-24 h-10'
                    />

                    <label className="p-2"> Updated </label>
                    <input 
                        value={updatedAt} 
                        onChange={e => setUpdatedAt(e.target.value)}
                        className='w-24 h-10'
                    />
                </div> */}

                <div>
                    <label className="font-medium text-sm">
                        Description
                        <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[120px] rounded resize overflow-auto"
                    />
                </div>

                <div>
                    <label className="font-medium text-sm"> 
                        Summary 
                        <label className="text-gray-500 ml-0.5 font-medium text-sm">(Optional)</label>
                    </label>
                    <textarea
                        value={summary || ""}
                        onChange={e => setSummary(e.target.value)}
                        className="w-full min-h-[120px] rounded resize overflow-auto"
                    />
                </div>

                <div className="flex justify-center">
                    <button type="submit">
                        Create Incident
                    </button>
                    <button type="button" onClick={handleBackButton}>
                        Back
                    </button>
                </div>
            </form>
            {result && (
                <div
                className={`text-center text-sm mt-4 ${
                    isError ? "text-red-600" : "text-green-600"
                }`}
                >
                {result}
                </div>
            )}
        </div>
          
    )
}

export default CreateIncident;