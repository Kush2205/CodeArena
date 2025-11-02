'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Loader from '../../ui/Loader';
export default function SignUpComponent() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        try {
             setLoading(true);
             setError('');
            e.preventDefault();
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            const res = await axios.post('/api/auth/signup', { name, email, password });
            if(res.status === 201) {
                localStorage.setItem('token', res.data.token);
                router.push('/contests');
            }
        } catch (error : any) {
            setLoading(false);
            setError(error.response?.data?.error || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-[50%]">
                <div className="bg-neutral-50 border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h1 className="text-5xl font-bold text-black mb-6 text-center">Sign Up</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-black mb-2">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-black mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-black mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-black mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center items-center py-3 px-4 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-all"
                        >
                            {loading ? <Loader size="small" /> : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-black">
                            Already have an account?{' '}
                            <button
                                onClick={() => router.push('/signin')}
                                className="font-bold underline hover:no-underline"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 text-center bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
