import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren } from 'react';
import { User } from '../api/schemas';
import { useAPI } from '../hooks/useAPI';

export const UserContext = createContext<User | null>(null);

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const api = useAPI();
  const { data } = useQuery({
    queryKey: api.user.getKey(),
    queryFn: api.user.query,
  });

  if (!data) {
    return null;
  }

  return (
    <UserContext.Provider value={data}>
      {children}
    </UserContext.Provider>
  );
};
