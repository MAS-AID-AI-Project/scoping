import RoomApp from '@/components/RoomApp'
import { PREFILLED_STATE } from '@/lib/prefilled'

export default function PrefilledPage() {
  return <RoomApp code="DEMO" initialState={PREFILLED_STATE} persist={false} />
}
