import RoomApp from '@/components/RoomApp'

interface Props {
  params: Promise<{ code: string }>
  searchParams: Promise<{ observe?: string }>
}

export default async function RoomPage({ params, searchParams }: Props) {
  const { code } = await params
  const { observe } = await searchParams
  return <RoomApp code={code} observe={observe === 'true'} />
}
