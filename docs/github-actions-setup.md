# GitHub Actions Setup and Troubleshooting

## Repository Secrets Required

For the GitHub Actions workflows to function properly, the following secrets must be configured in the repository settings:

### Required Secrets

1. **`GH_WORKFLOW_TOKEN`** - A GitHub Personal Access Token with workflow dispatch permissions
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a token with the following scopes:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)
     - `actions:write` (Write actions and workflows)
   - Add this token as a repository secret named `GH_WORKFLOW_TOKEN`

2. **`GITHUB_TOKEN`** - This is automatically provided by GitHub Actions
   - Should have the permissions set in the workflow file
   - No manual configuration required

3. **`NX_CLOUD_AUTH_TOKEN`** - For Nx Cloud integration (if used)
   - Obtain from Nx Cloud dashboard
   - Add as repository secret

4. **Container Registry Secrets** (for build workflow):
   - `ACR_ENDPOINT` - Azure Container Registry endpoint
   - `ACR_USERNAME` - Azure Container Registry username  
   - `ACR_PASSWORD` - Azure Container Registry password

## Repository Settings

### Actions Permissions

1. Go to Repository Settings > Actions > General
2. Set "Actions permissions" to "Allow all actions and reusable workflows"
3. Set "Workflow permissions" to "Read and write permissions"
4. Check "Allow GitHub Actions to create and approve pull requests"

### Default GITHUB_TOKEN Permissions

The workflows now include explicit permissions that should work with the default `GITHUB_TOKEN`:

```yaml
permissions:
  contents: write
  actions: write
  pull-requests: read
```

## Troubleshooting Common Issues

### HTTP 403: Resource not accessible by integration

This error occurs when:
1. The `GH_WORKFLOW_TOKEN` secret is missing or invalid
2. Repository workflow permissions are too restrictive
3. The token doesn't have the required scopes

**Solution**: 
1. Verify the `GH_WORKFLOW_TOKEN` secret exists and has correct permissions
2. Check repository Actions settings as described above
3. The workflow will fallback to `GITHUB_TOKEN` if `GH_WORKFLOW_TOKEN` is not available

### Workflow dispatch fails

**Symptoms**: 
- "could not create workflow dispatch event" error
- HTTP 403 errors when trying to trigger builds

**Solution**:
1. Ensure the target workflow file (`build.yml`) exists
2. Verify the workflow has `workflow_dispatch` trigger configured
3. Check that the repository permissions allow workflow dispatch

### Token permissions insufficient

**Symptoms**:
- "Resource not accessible" errors
- Authentication failures

**Solution**:
1. Regenerate the `GH_WORKFLOW_TOKEN` with correct scopes
2. Verify repository settings allow the required actions
3. Check that the token hasn't expired

## Workflow Dispatch Process

The `pre-build.yml` workflow uses the following process to dispatch the build workflow:

1. **Permission Check**: Lists available workflows to verify API access
2. **Workflow Discovery**: Finds the target `build.yml` workflow
3. **Primary Dispatch**: Attempts to dispatch using workflow filename
4. **Fallback Dispatch**: If filename fails, retries using workflow ID
5. **Error Handling**: Provides detailed logging for troubleshooting

## Testing the Fix

After applying the fixes and configuring secrets:

1. Push changes to the `main` branch
2. Monitor the workflow run in the Actions tab
3. Check the "dispatch-build" job logs for detailed output
4. Verify that the build workflow is triggered successfully

## Monitoring

Key metrics to monitor:
- Workflow dispatch success rate
- Build workflow trigger frequency
- Authentication failures
- Permission-related errors

Review the Actions tab regularly to ensure workflows are running as expected.