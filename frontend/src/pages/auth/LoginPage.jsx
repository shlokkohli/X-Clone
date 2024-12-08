import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../components/svgs/X.jsx";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";

import {useMutation, useQueryClient} from '@tanstack/react-query'
import toast from "react-hot-toast";

function LoginPage() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const queryClient = useQueryClient();

	const {mutate, isPending, isError, error} = useMutation({
		mutationFn: async ({username, password}) => {
			try {
				const res = await fetch('/api/auth/login', {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ username, password })
				})

				const data = await res.json();

				if(!data.success){
					throw new Error(data.message || "Failed Login")
				}
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['authUser']});
			queryClient.invalidateQueries({queryKey: ['userProfile']});
			queryClient.invalidateQueries({queryKey: ['following']});
		}}
)

	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-3/3 fill-white w-60' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-6xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2 p-4'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow p-4'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow p-4'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white bg-blue-400 text-xl'>
						{isPending ? "Loading..." : "Login"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full text-blue-400 btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;