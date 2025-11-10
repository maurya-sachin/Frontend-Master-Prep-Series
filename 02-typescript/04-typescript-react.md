# TypeScript with React

> Typing React components, props, hooks, events, and best practices for React + TypeScript.

---

## Question 1: Typing React Components

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Meta, Google, Microsoft

### Question
How do you type React components, props, and hooks in TypeScript?

### Answer

```typescript
// Function Component with Props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return <button onClick={onClick}>{label}</button>;
};

// Or without React.FC (preferred)
function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// useState with types
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useRef with types
const inputRef = useRef<HTMLInputElement>(null);

// Event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log('clicked');
};
```

### Resources
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

