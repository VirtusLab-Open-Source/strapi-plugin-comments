import { CustomInjectionZone } from '../../components/CustomInjectionZone';
import { useReports } from '../../hooks/useReports';

export const AiEvaluations = () => {
  const { data: { result, pagination } } = useReports();

  return <CustomInjectionZone area="comments.pages.aiEvaluations" reports={result} />;
};
