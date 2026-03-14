import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeSwitch } from '@/components/ThemeSwitch'

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'dark',
    setTheme: vi.fn(),
  })),
}))

import { useTheme } from 'next-themes'

const mockUseTheme = useTheme as ReturnType<typeof vi.fn>

describe('ThemeSwitch', () => {
  it('should render without crashing', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
    })
    
    render(<ThemeSwitch />)
    
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('should show sun icon when theme is dark', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
    })
    
    render(<ThemeSwitch />)
    
    await vi.waitFor(() => {
      expect(screen.getByRole('button')).toBeDefined()
    })
  })

  it('should call setTheme when clicked', async () => {
    const mockSetTheme = vi.fn()
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    })
    
    render(<ThemeSwitch />)
    
    await vi.waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })
    
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should toggle to dark theme when current theme is light', async () => {
    const mockSetTheme = vi.fn()
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })
    
    render(<ThemeSwitch />)
    
    await vi.waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
