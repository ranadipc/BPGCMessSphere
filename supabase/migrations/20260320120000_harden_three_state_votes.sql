CREATE OR REPLACE FUNCTION public.normalize_votes_payload(input jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  key text;
  value jsonb;
  normalized jsonb := '{}'::jsonb;
  normalized_meal jsonb;
  a_value int;
  b_value int;
  extra_key text;
BEGIN
  IF input IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;

  IF jsonb_typeof(input) <> 'object' THEN
    RAISE EXCEPTION 'votes payload must be a JSON object';
  END IF;

  FOR key, value IN SELECT * FROM jsonb_each(input)
  LOOP
    IF key NOT IN (
      'MON_BRE', 'MON_LUN', 'MON_SNA', 'MON_DIN',
      'TUE_BRE', 'TUE_LUN', 'TUE_SNA', 'TUE_DIN',
      'WED_BRE', 'WED_LUN', 'WED_SNA', 'WED_DIN',
      'THU_BRE', 'THU_LUN', 'THU_SNA', 'THU_DIN',
      'FRI_BRE', 'FRI_LUN', 'FRI_SNA', 'FRI_DIN',
      'SAT_BRE', 'SAT_LUN', 'SAT_SNA', 'SAT_DIN',
      'SUN_BRE', 'SUN_LUN', 'SUN_SNA', 'SUN_DIN'
    ) THEN
      RAISE EXCEPTION 'invalid meal key %', key;
    END IF;

    IF jsonb_typeof(value) = 'string' THEN
      IF value = '"A"'::jsonb THEN
        normalized_meal := jsonb_build_object('A', 1, 'B', 0);
      ELSIF value = '"B"'::jsonb THEN
        normalized_meal := jsonb_build_object('A', 0, 'B', 1);
      ELSE
        RAISE EXCEPTION 'invalid legacy vote value for %', key;
      END IF;
    ELSIF jsonb_typeof(value) = 'object' THEN
      FOR extra_key IN SELECT jsonb_object_keys(value)
      LOOP
        IF extra_key NOT IN ('A', 'B') THEN
          RAISE EXCEPTION 'invalid vote key % for meal %', extra_key, key;
        END IF;
      END LOOP;

      IF value ? 'A' AND COALESCE(value->>'A', '') NOT IN ('-1', '0', '1') THEN
        RAISE EXCEPTION 'invalid Menu A vote value for %', key;
      END IF;

      IF value ? 'B' AND COALESCE(value->>'B', '') NOT IN ('-1', '0', '1') THEN
        RAISE EXCEPTION 'invalid Menu B vote value for %', key;
      END IF;

      a_value := COALESCE((value->>'A')::int, 0);
      b_value := COALESCE((value->>'B')::int, 0);
      normalized_meal := jsonb_build_object('A', a_value, 'B', b_value);
    ELSE
      RAISE EXCEPTION 'invalid vote shape for %', key;
    END IF;

    normalized := normalized || jsonb_build_object(key, normalized_meal);
  END LOOP;

  RETURN normalized;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_votes_row()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  meal_key text;
  meal_vote jsonb;
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'users can only write their own votes';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.user_id <> NEW.user_id THEN
      RAISE EXCEPTION 'user_id cannot be changed';
    END IF;

    IF OLD.status = 'submitted' THEN
      RAISE EXCEPTION 'submitted votes cannot be edited';
    END IF;
  END IF;

  NEW.votes := public.normalize_votes_payload(NEW.votes);

  IF NEW.status = 'submitted' THEN
    FOREACH meal_key IN ARRAY ARRAY[
      'MON_BRE', 'MON_LUN', 'MON_SNA', 'MON_DIN',
      'TUE_BRE', 'TUE_LUN', 'TUE_SNA', 'TUE_DIN',
      'WED_BRE', 'WED_LUN', 'WED_SNA', 'WED_DIN',
      'THU_BRE', 'THU_LUN', 'THU_SNA', 'THU_DIN',
      'FRI_BRE', 'FRI_LUN', 'FRI_SNA', 'FRI_DIN',
      'SAT_BRE', 'SAT_LUN', 'SAT_SNA', 'SAT_DIN',
      'SUN_BRE', 'SUN_LUN', 'SUN_SNA', 'SUN_DIN'
    ]
    LOOP
      meal_vote := NEW.votes -> meal_key;

      IF meal_vote IS NULL THEN
        RAISE EXCEPTION 'missing submitted vote for %', meal_key;
      END IF;

      IF COALESCE((meal_vote->>'A')::int, 0) <> 1
         AND COALESCE((meal_vote->>'B')::int, 0) <> 1 THEN
        RAISE EXCEPTION 'submitted votes require at least one positive selection for %', meal_key;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_votes_before_write ON public.votes;
CREATE TRIGGER validate_votes_before_write
  BEFORE INSERT OR UPDATE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_votes_row();

DROP POLICY IF EXISTS "Users can insert own votes" ON public.votes;
CREATE POLICY "Users can insert own votes" ON public.votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own draft votes" ON public.votes;
CREATE POLICY "Users can update own draft votes" ON public.votes
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft')
  WITH CHECK (auth.uid() = user_id AND status IN ('draft', 'submitted'));
