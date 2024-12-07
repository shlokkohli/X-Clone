import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

import {useQuery} from '@tanstack/react-query'
import { useEffect } from "react";

const Posts = ({feedType}) => {

	const getPostEndPoint = () => {

		if(feedType == 'forYou'){
			return '/api/posts/all'
		}
		else if(feedType == 'following'){
			return '/api/posts/following'
		}

		return '/api/posts/all'
	}

	const POST_ENDPOINT = getPostEndPoint();

	const {data, isLoading, isError, refetch, isRefetching} = useQuery({
		queryKey: ['posts', feedType],
		queryFn: async() => {
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();

				return data;

			} catch (error) {
				throw new Error(error);
			}
		}
	})

	useEffect(() => {
		refetch();
	}, [feedType, refetch])


	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{(isError || !data?.success) && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && data?.success && (
				<div>
					{data.data.posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;