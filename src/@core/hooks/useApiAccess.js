import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'src/Context/AuthContext'
import { useLoading } from './useLoading'; 
import { api } from 'src/utils/Rest-API';

export const useApiAccess = (addApi, editApi, approveApi) => {
  const { removeAuthToken } = useAuth();
  const { setIsLoading } = useLoading();
  const router = useRouter();
  const [apiAccess, setApiAccess] = useState({});
  useEffect(() => {
    const fetchApiAccess = async () => {
      try {
        setIsLoading(true);
        const res = await api("/feature/api-access-by-name/", { apiNames: [addApi, editApi, approveApi] }, 'post', true);
        // console.log("api access", res.data);

        if (res.data.success) {
            const access = {
                addApiAccess: false,
                editApiAccess: false,
                approveApiAccess: false
            };
            res.data.data.forEach(item => {
                if (item.name.toLowerCase() === addApi) {
                  access.addApiAccess = item.add_api_access || false;
                }
                if (item.name.toLowerCase() === editApi) {
                    access.editApiAccess = item.update_api_access || false;
                }
                if (item.name.toLowerCase() === approveApi) {
                    access.approveApiAccess = item.approve_api_access || false;
                }
            });
            setApiAccess(access);
            // console.log('Api access ', access);
          } else if (res.data.code === 401) {
            removeAuthToken();
            router.push('/401');
          }
      } catch (error) {
        console.log('Error getting API access', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiAccess();
  }, [addApi, editApi, approveApi, removeAuthToken, router, setIsLoading]);

  return apiAccess;
};
