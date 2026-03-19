import { useState } from 'react'
import { signUpUser } from './auth'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
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
        onChange={e => setFullName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button type="submit">Sign Up</button>

      <p>{message}</p>
    </form>
  )
}
