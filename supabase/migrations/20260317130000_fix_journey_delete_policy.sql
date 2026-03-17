-- Add missing DELETE policy for user_journeys
-- Users could not delete their own journey records without this policy.
CREATE POLICY "Users can delete own journeys"
  ON user_journeys
  FOR DELETE
  USING (user_id = auth.uid());
