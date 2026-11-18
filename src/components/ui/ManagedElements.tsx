import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { useInterfaceCopy } from './InterfaceText';

type CopyProps = { copyScope: string };
function useCopyAttributes<T extends object>(scope: string, props: T): T {
  const translate = useInterfaceCopy(scope);
  const result = { ...props } as Record<string, unknown>;
  for (const name of ['placeholder', 'title', 'aria-label', 'alt']) {
    if (typeof result[name] === 'string') result[name] = translate(result[name] as string);
  }
  return result as T;
}
export const ManagedInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'> & CopyProps>(({ copyScope, ...props }, ref) => <input {...useCopyAttributes(copyScope, props)} ref={ref}
  maxLength={props.maxLength ?? (props.type === 'email' ? 254 : props.type === 'tel' ? 32 : props.type === 'text' ? 500 : undefined)}
  onChange={(event) => {
    if (props.type === 'tel') event.target.value = event.target.value.replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776));
    props.onChange?.(event);
  }} />);
export const ManagedTextarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<'textarea'> & CopyProps>(({ copyScope, ...props }, ref) => <textarea {...useCopyAttributes(copyScope, props)} maxLength={props.maxLength ?? 6000} ref={ref} />);
export const ManagedImg = forwardRef<HTMLImageElement, ComponentPropsWithoutRef<'img'> & CopyProps>(({ copyScope, ...props }, ref) => <img {...useCopyAttributes(copyScope, props)} ref={ref} />);
export const ManagedA = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'> & CopyProps>(({ copyScope, ...props }, ref) => <a {...useCopyAttributes(copyScope, props)} ref={ref} />);
export const ManagedButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'> & CopyProps>(({ copyScope, ...props }, ref) => <button {...useCopyAttributes(copyScope, props)} ref={ref} />);
