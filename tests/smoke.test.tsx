// @vitest-environment jsdom
// Smoke flows per PRD §4 (three tool flows) rendered with React Testing Library.
import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import App from '../src/App'

const decimalInput = (): HTMLInputElement =>
  document.querySelector('input[inputmode="decimal"]') as HTMLInputElement

describe('smoke flow 1: length converter is reachable and computes live', () => {
  it('25.4 mm input shows 1 inch result', async () => {
    cleanup()
    window.location.hash = '#/convert'
    render(<App />)
    await screen.findByText('Formula & notes', {}, { timeout: 4000 })
    fireEvent.change(decimalInput(), { target: { value: '25.4' } })
    await waitFor(() => {
      const body = document.body.textContent as string
      expect(body).toContain('1inches')
      expect(body).toContain('2.54cm')
    })
  })
})

describe('smoke flow 2: invalid input never shows NaN', () => {
  it('garbage input means neutral dash, not NaN', async () => {
    cleanup()
    window.location.hash = '#/convert'
    render(<App />)
    await screen.findByText('Formula & notes', {}, { timeout: 4000 })
    fireEvent.change(decimalInput(), { target: { value: 'oops' } })
    expect(document.body.textContent).not.toContain('NaN')
    expect(document.body.textContent).toContain('—')
  })
})

describe('smoke flow 3: global search palette finds tools', () => {
  it('typing "cost" finds Print Cost', async () => {
    cleanup()
    window.location.hash = '#/'
    render(<App />)
    const openBtn = screen.getAllByRole('button').find((b) => (b as HTMLButtonElement).getAttribute('aria-label') === 'Search tools') as HTMLButtonElement
    fireEvent.click(openBtn)
    const search = screen.getAllByLabelText('Search tools').find((el) => (el as HTMLInputElement).tagName === 'INPUT') as HTMLInputElement
    fireEvent.change(search, { target: { value: 'cost' } })
    expect(screen.getAllByText('Print Cost').length).toBeTruthy()
  })
})
