declare module 'react-use-keypress' {
    export default function useKeypress(
        key: string | string[],
        callback?: (event: KeyboardEvent) => void
    ): void
} 