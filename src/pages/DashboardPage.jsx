import React from "react"

const DashboardPage = ({ onLogout }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return (
        <div>
            <div>
                <div>
                    <h1>
                        Welcome, {userInfo?.userName || 'Admin'}
                    </h1>
                    <button
                        onClick={onLogout} 
                    >
                        Logout
                    </button>
                </div>
                <p>
                    This is your dashboard. You are successfully logged in.
                </p>
            </div>
        </div>
    )
}

export default DashboardPage