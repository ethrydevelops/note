import { useLocation } from 'preact-iso';

export default function Link({
    class: c,
    className,
    activeClass,
    activeClassName,
    ...props
}) {
    const inactive = [c, className].filter(Boolean).join(' ');
    const active = [c, className, activeClass, activeClassName].filter(Boolean).join(' ');
    const matches = useLocation().url === props.href;

    return <a { ...props } class={matches ? active : inactive} />;
}