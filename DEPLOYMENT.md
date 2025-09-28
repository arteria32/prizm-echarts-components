# Storybook Deployment to GitHub Pages

This project includes automated deployment of Storybook to GitHub Pages using GitHub Actions.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to the "Pages" section in the left sidebar
3. Under "Source", select "GitHub Actions"
4. Save the settings

### 2. Repository Settings

Make sure your repository has the following settings:
- **Actions**: Enabled
- **Pages**: Source set to "GitHub Actions"

### 3. Environment Protection Rules (if needed)

If you encounter branch protection errors, you may need to configure environment protection rules:

1. Go to **Settings** → **Environments**
2. Click on **github-pages** environment
3. Under **Protection rules**, you can:
   - **Remove branch restrictions** if you want to allow all branches
   - **Add specific branches** that are allowed to deploy
   - **Configure required reviewers** if you want manual approval

**Common configurations:**
- **Allow all branches**: Remove all branch restrictions
- **Allow specific branches**: Add `main` and any other branches you want to allow
- **No restrictions**: Disable all protection rules for automatic deployment

### 4. Workflow Configuration

The deployment workflow (`.github/workflows/deploy-storybook.yml`) will automatically:
- Trigger on pushes to `main` branch
- Build the Storybook using `npm run build-storybook`
- Deploy the built files to GitHub Pages

**Manual Deployment:**
- You can also trigger deployments manually from the Actions tab
- Use the "Run workflow" button to deploy from any branch

### 5. Manual Deployment

If you need to manually trigger a deployment:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy Storybook to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### 5. Accessing Your Storybook

Once deployed, your Storybook will be available at:
```
https://[your-username].github.io/[repository-name]
```

## Workflow Details

The GitHub Action workflow includes:

- **Build Job**: 
  - Checks out the code
  - Sets up Node.js 18
  - Installs dependencies
  - Builds Storybook
  - Uploads the build artifact

- **Deploy Job**:
  - Deploys the built Storybook to GitHub Pages
  - Provides the deployment URL

## Troubleshooting

### Common Issues

1. **Permission Errors**: Make sure GitHub Pages is enabled and the repository has the correct permissions
2. **Build Failures**: Check that all dependencies are properly installed and the build script works locally
3. **Deployment Not Triggering**: Ensure the workflow file is in the correct location (`.github/workflows/`)

### Local Testing

Before pushing, test the build locally:
```bash
npm run build-storybook
```

This will create a `storybook-static` folder that you can serve locally to verify the build works correctly.

## Customization

To customize the deployment:

1. **Change Trigger Branches**: Modify the `on.push.branches` in the workflow file
2. **Add Environment Variables**: Add them in the workflow file under the appropriate job
3. **Modify Build Process**: Update the build steps in the workflow file

## Security

The workflow uses:
- `GITHUB_TOKEN` for authentication (automatically provided)
- Proper permissions scoping (only what's needed for Pages deployment)
- No external secrets required for basic deployment
