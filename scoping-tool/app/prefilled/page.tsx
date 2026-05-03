import ScopingApp from '@/components/ScopingApp'
import { PREFILLED_STATE } from '@/lib/prefilled'

export default function PrefilledPage() {
  return <ScopingApp initialState={PREFILLED_STATE} persist={false} />
}
