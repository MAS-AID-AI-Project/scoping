import RoomApp from '@/components/RoomApp'

interface Props {
  params: { code: string }
  searchParams: { observe?: string }
}

export default function RoomPage({ params, searchParams }: Props) {
  const observe = searchParams.observe === 'true'
  return <RoomApp code={params.code} observe={observe} />
}
