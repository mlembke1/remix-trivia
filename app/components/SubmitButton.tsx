import { useEffect, useState } from "react"

export const SubmitButton = (props: any) => {
    const [isSubmitting, setIsSubmitting] = useState();
    useEffect(() => {
        setIsSubmitting(props.isSubmitting)
    },[props.isSubmitting])

    return (
        <div>
            { isSubmitting ?
                <div>
                    <div className="animate-pulse">
                        <button className="bg-slate-200	w-48 border-2 p-2 border-radius-2 text-center mt-4 rounded-lg mb-20">Loading ...</button>    
                    </div>
                </div>
                :
                <button className="bg-slate-200	w-48 border-2 p-2 border-radius-2 text-center mt-4 rounded-lg mb-20">{props.text}</button>
            }
        </div>
    )
}