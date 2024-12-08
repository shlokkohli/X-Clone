import { toast } from 'react-hot-toast';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

function useFollow() {

    const queryClient = useQueryClient();

    const {mutate: follow, isPending} = useMutation({
        mutationFn: async(userId) => {
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method: "POST",
                })
    
                const data = await res.json();
    
                if(!data.success){
                    throw new Error(data.message);
                }

                return data;
            } catch (error) {
                throw new Error(error)
            }
        },
        onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			]);
        }
    });

    return {follow, isPending}

}

export default useFollow;