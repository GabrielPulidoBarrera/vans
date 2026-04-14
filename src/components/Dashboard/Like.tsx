import { actions } from 'astro:actions';
import { withState } from '@astrojs/react/actions';
import { useActionState } from "react";

export function Like({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(
    withState(actions.like),
    { data: 0, error: undefined }, // initial likes and errors
  );

  return (
    <form action={action}>
      <input type="hidden" name="postId" value={postId} />
      <button disabled={pending}>{state.data} ❤️</button>
    </form>
  );
}