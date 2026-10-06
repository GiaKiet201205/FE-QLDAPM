const variants = {
  primary: 'border-[#173557] bg-[#173557] text-white hover:bg-[#24486f]',
  secondary: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
}

export default function Button({ variant = 'secondary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
