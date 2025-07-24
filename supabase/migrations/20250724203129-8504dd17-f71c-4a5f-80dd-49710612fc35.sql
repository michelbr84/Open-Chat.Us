-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.track_message_edits()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.message_edit_history (
      message_id, 
      editor_id, 
      original_content, 
      new_content
    ) VALUES (
      NEW.id,
      auth.uid(),
      OLD.content,
      NEW.content
    );
    
    -- Update edited_at timestamp
    NEW.edited_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';