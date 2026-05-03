import React, { useRef, useEffect } from "react";

const ConfirmModal = (props: {
    confirmMessage: string
    setShowConfirmModal: React.Dispatch<React.SetStateAction<boolean>>
    callbackAfterConfirm: () => void
}) => {

    const logoutConfirmModalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (logoutConfirmModalRef.current && !logoutConfirmModalRef.current.contains(e.target as Node)) {
                props.setShowConfirmModal(false);
            }
        }; 
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <div ref={logoutConfirmModalRef} className="bg-white/10 w-full text-white max-w-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="text-xl font-semibold text-white/90">{props.confirmMessage}</h2>
                        <button 
                            onClick={() => props.setShowConfirmModal(false)} 
                            className="text-white/50 hover:text-white transition-colors p-1"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="px-6 py-4 flex justify-between gap-3 bg-white/5 border-t border-white/10">
                        <button 
                            onClick={() => props.setShowConfirmModal(false)} 
                            className="grow px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors rounded-xl"
                        >
                            No
                        </button>
                        <button 
                            onClick={() => { props.setShowConfirmModal(false); props.callbackAfterConfirm() }} 
                            className="grow px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors rounded-xl"
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default ConfirmModal;