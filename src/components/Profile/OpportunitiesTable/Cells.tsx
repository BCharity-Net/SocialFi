export const ProfileCell = (props: { value: string }) => {
  const user = props.value
  return (
    <a href={`/u/${user}`} target="_blank" rel="noopener noreferrer">
      {user}
    </a>
  )
}
