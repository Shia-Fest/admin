import React, {useState} from "react";
import api from "../services/api";

const LoginPage = ({ onLoginSuccess }) => {
    const [ userName, setUserName ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ error, setError ] = useState('')
    const [ loading, setLoading ] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('')
        setLoading(true)

        if(!userName || !password) {
            setError('Please provide both User Name and Password');
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.post('/auth/login', {
                userName, 
                password, 
            }) 
            localStorage.setItem('userInfo', JSON.stringify(data))
            onLoginSuccess();
        }
        catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please try again'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadows-md">
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Admin Panel Login
                </h2>
                <form onSubmit={handleLogin}>
                    { error && (
                        <p>
                            {error}
                        </p>
                    )}
                    <div>
                        <div>
                            <label htmlFor="username">User Name</label>
                            <input 
                            type="text"
                            id="username"
                            name="username"
                            required
                            placeholder="User Name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <input 
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading} 
                        >
                            {loading ? 'Logging in' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;