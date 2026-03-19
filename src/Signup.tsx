import { useState } from 'react'
import { signUpUser } from './auth'

export default function Signup(): JSX.Element {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { user, error } = await signUpUser(email, password, fullName)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Check your email to confirm your account.')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={e => setFullName((e.target as HTMLInputElement).value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail((e.target as HTMLInputElement).value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword((e.target as HTMLInputElement).value)}
      />

      <button type="submit">Sign Up</button>

      <p>{message}</p>
    </form>
  )
}
