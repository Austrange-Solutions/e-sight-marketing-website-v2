import { Loader2 } from 'lucide-react'
import React from 'react'

function loading() {
    return (
        <div className='flex justify-center items-center h-screen w-full'><Loader2 width={100} height={100} className='animate-spin text-primary' /></div>
    )
}

export default loading