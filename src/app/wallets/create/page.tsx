"use client";

import CreateWallet from "@/app/components/CreateWallet";

const walletCreate = () => {
    return <main>
        <div className="flex min-h-screen flex-col p-10">
            <CreateWallet />
        </div>
    </main>
}

export default walletCreate;