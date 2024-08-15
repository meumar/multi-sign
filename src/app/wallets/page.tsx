"use client";

import AllWallets from "../components/AllWallets";

const walletPage = () => {
    return <main>
        <div className="flex min-h-screen flex-col items-center justify-between p-10">
            <AllWallets />
        </div>
    </main>
}

export default walletPage