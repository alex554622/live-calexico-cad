
import { useOfficerFetch } from './useOfficerFetch';
import { useOfficerCreate } from './useOfficerCreate';
import { useOfficerUpdate } from './useOfficerUpdate';
import { useOfficerDelete } from './useOfficerDelete';

export function useOfficerData(toast: any) {
  const { officers, loadingOfficers, fetchOfficers, setOfficers } = useOfficerFetch(toast);
  const { createOfficer } = useOfficerCreate(toast, setOfficers);
  const { updateOfficerStatus, updateOfficer } = useOfficerUpdate(toast, setOfficers);
  const { deleteOfficer } = useOfficerDelete(toast, setOfficers);

  return {
    officers,
    loadingOfficers,
    fetchOfficers,
    updateOfficerStatus,
    createOfficer,
    updateOfficer,
    deleteOfficer
  };
}
