import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export const useUserContext = () => {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error('UserContext is not provided');
  }
  return user;
};
