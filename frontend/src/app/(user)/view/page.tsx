"use client"

import useFireBaseAuth from "@/hooks/useFirebaseAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast'

type Incident = {
    id: string;
    userId: string;
    type: string;
    description: string;
    summary?: string;
    createdAt: string;
    updatedAt: string;
}

const ViewIncident = () => {

    const router = useRouter();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [summary, setSummary] = useState('');
 
    const { user, isLoading } = useFireBaseAuth();
    
    const getIncident = async () => {
        setLoading(true);

        try {
            if(!user) {
                toast.error("Error authorizing user");
                return;
            }
            const token = await user.getIdToken();
            console.log(id)
            const result = await fetch(`http://localhost:4000/incidents/${id}`, {
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
            setType(data.type);
            setDescription(data.description);
            setSummary(data.summary || "");
            console.log("summary: ", summary)
            setIncident(data);
        } catch (error) {
            console.log(error);
            toast.error("Error retrieving incidents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoading) return;
        if (!id) return;
        if (!user) {
            toast.error("Not logged in.");
            return;
        }

        getIncident()
    }, [user, id, isLoading, summary]);

    if (!incident) {
        return (
          <div className="flex justify-center mt-10 text-gray-600">
            No incident found.
          </div>
        );
    }

    if (loading) {
        return (
          <div className="flex justify-center mt-10 text-gray-600">
            Loading incident...
          </div>
        );
    }

    const handleUpdateIncident = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if(!user) {
                toast.error("Error creating incident");
                return;
            }

            const token = await user.getIdToken();
            const result = await fetch(`http://localhost:4000/incidents/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type,
                    description,
                    summary,
                })
            })

            const data = await result.json();

            if (!data || data.error) {
                console.log(data);
                toast.error("Error updating incident");
                return;
            }
            console.log("Incident updated for ", data);
            toast.success("Incident Updated Successfully!");

        } catch (error) {
            console.log(error);
            toast.error("Error updating incident");
        }
    }

    const handleBackButton = () => {
        router.push("/dashboard");
    }
    
    const handleSummaryGeneration = async () => {
        try {
            if(!user) {
                toast.error("Error generating summary for incident");
                return;
            }

            const token = await user.getIdToken();
            const result = await fetch(`http://localhost:4000/incidents/${id}/summarize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type,
                    description,
                    summary,
                })
            })

            const data = await result.json();

            if (!data || data.error) {
                console.log(data);
                toast.error("Error generating summary");
                return;
            }
            console.log("Incident summary generated and updated for ", data);
            toast.success("Incident Summary Generated Successfully!");
            await getIncident();
        } catch (error) {
            console.log(error);
            toast.error("Error generating summary");
        }
    }
    
    return (
        <div className="container justify-center"> 
            <form onSubmit={handleUpdateIncident} className="space-y-4">
                <div className="flex justify-center font-bold text-2xl">
                    Incident Details
                </div>

                <div>
                    <label className='font-medium text-sm'> ID </label>
                    <input 
                        value={incident.id} 
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

                <div className="flex justify-center">
                    <button type="button" className="AI-button" onClick={handleSummaryGeneration}>
                        Generate AI Summary
                    </button>
                </div>

                <div>
                    <label className="font-medium text-sm"> 
                        Summary 
                        <label className="text-gray-500 ml-0.5 font-medium text-sm">(Optional)</label>
                    </label>
                    <textarea
                        value={summary || ""}
                        readOnly
                        onChange={e => setSummary(e.target.value)}
                        className="w-full min-h-[120px] rounded resize overflow-auto"
                    />
                </div>

                <div className="flex justify-center">
                    <button type="submit">
                        Update Incident
                    </button>
                    <button type="button" onClick={handleBackButton}>
                        Back
                    </button>
                </div>
            </form>
        </div>
          
    )
}

export default ViewIncident;