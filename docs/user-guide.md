# HoneyChain – User Guide

## 1. Introduction

HoneyChain is a blockchain-powered honey traceability and smart beekeeping application. It helps beekeepers manage their beehives, register honey harvest batches, monitor production stages, and provide transparent batch information through QR-code-based verification.

This guide explains how to use the application's main features.

## 2. Accessing the Application

Open the HoneyChain application:

**Live Application:** https://honeychainapito.netlify.app

The landing page provides an introduction to the platform and access to account registration and login.

### 2.1 Creating an Account

1. Open the application.
2. Select **Create Account** or navigate to the Register page.
3. Enter your full name.
4. Enter your email address.
5. Create a password containing at least 8 characters.
6. Select **Create Account**.

After successful registration, you will be redirected to the dashboard.

### 2.2 Logging In

1. Open the Login page.
2. Enter your registered email address.
3. Enter your password.
4. Select **Sign In**.

After successful authentication, you will be redirected to the dashboard.

The dashboard, hive management and batch management pages require authentication.

## 3. Dashboard

The Dashboard provides an overview of beekeeping activities and honey production.

It displays the following information:

- **Active Hives:** Number of currently active beehives.
- **Honey Harvested:** Total recorded honey quantity.
- **Need Inspection:** Number of hives requiring inspection.
- **Packaged Batches:** Number of batches with Packaged or Verified status.

### 3.1 Harvest Statistics

The dashboard includes a bar chart showing honey harvest quantities across the last six calendar months.

### 3.2 Hive Health Overview

Hive health information is presented through three categories:

- Healthy
- Needs Inspection
- Under Observation

### 3.3 Recent Batches

The dashboard displays the five most recently registered batches, ordered by harvest date.

Use the **Refresh Data** option to reload dashboard information.

## 4. Hive Management

The Hive Management section allows beekeepers to register and maintain information about their beehives.

### 4.1 Registering a Hive

1. Open **Hive Management** from the sidebar.
2. Select **Add Hive**.
3. Enter the required hive information:
   - Hive ID
   - Hive Name
   - Location
   - Bee Type
   - Hive Status
   - Last Inspection Date
4. Add optional notes if required.
5. Save the hive.

Available bee types:

- Indian Honey Bee
- Italian Honey Bee
- Carniolan Honey Bee
- Other / Unknown

Available hive statuses:

- Healthy
- Needs Inspection
- Under Observation

The inspection date cannot be set to a future date.

### 4.2 Searching and Filtering Hives

The hive management page provides search and status-filtering options.

Hives can be searched using:

- Hive ID
- Hive name
- Location
- Bee type

The status filter helps identify hives belonging to a particular health category.

### 4.3 Editing Hive Information

1. Find the hive in the hive list.
2. Select its **Edit** option.
3. Modify the available information.
4. Save the changes.

The Hive ID cannot be changed while editing an existing hive.

### 4.4 Deactivating a Hive

The application provides a Deactivate option for existing hives.

1. Find the hive.
2. Select **Deactivate**.
3. Confirm the action.

Deactivation is a soft-deactivation operation. It allows the application to retain the hive record while marking it as inactive.

Inactive hives are not available for selection when creating new honey batches.

## 5. Honey Batch Management

The Honey Batches section allows beekeepers to register honey harvests and track their progress.

### 5.1 Creating a Honey Batch

Before creating a batch, at least one active hive must be registered.

1. Open **Honey Batches** from the sidebar.
2. Select **Create Batch**.
3. Enter the following information:

| Field | Description |
|---|---|
| Batch ID | Unique identifier for the honey batch |
| Honey Type | Type or variety of honey |
| Source Hive | Active hive from which the honey was harvested |
| Quantity | Harvested honey quantity in kilograms |
| Harvest Date | Date of honey harvesting |
| Apiary Location | Location of the source apiary |
| Notes | Optional harvest observations |

4. Review the entered information.
5. Select **Save Batch**.

The selected hive's location is automatically used to populate the apiary location field. It can be adjusted before saving.

The quantity must be between 0.1 kg and 100,000 kg, and the harvest date cannot be in the future.

After successful creation, the batch appears in the batch list.

### 5.2 Viewing Batch Information

The batch management page displays:

- Batch ID
- Honey type
- Source hive name and ID
- Harvest quantity
- Harvest date
- Current status

The page also provides four summary metrics:

- Total Batches
- Harvested
- Processing
- Packaged

### 5.3 Searching and Filtering Batches

Users can search for batches using:

- Batch ID
- Honey type
- Apiary location
- Source hive ID
- Source hive name

The status filter allows users to view batches belonging to a selected stage.

Available filter categories include:

- All
- Harvested
- Processing
- Packaged
- Verified

### 5.4 Updating Batch Status

The application supports the following batch statuses:

1. **Harvested:** Honey has been collected from the source hive.
2. **Processing:** The harvested honey is undergoing processing.
3. **Packaged:** The honey has been packaged.
4. **Verified:** The batch has a blockchain verification record.

For batches that are not yet Verified, users can update the status through the Update Status dropdown.

Select the appropriate status to save the change.

A batch marked as Verified displays its blockchain verification status instead of the manual status-update dropdown.

## 6. QR Code Generation and Honey Labels

HoneyChain provides QR codes to make batch traceability accessible to consumers.

### 6.1 Generating a Batch QR Code

1. Open **Honey Batches**.
2. Find the required batch.
3. Select **QR Code** in its Actions column.
4. Wait for the QR code to generate.

The QR preview displays:

- Batch ID
- Generated QR code
- Public verification URL

### 6.2 Downloading a QR Code

Select **Download QR Code** in the QR preview window to download the generated QR image.

The QR code can be used on honey packaging or other batch-related materials.

### 6.3 Printing a Honey Label

1. Open the QR preview for the required batch.
2. Select **Print Honey Label**.
3. Allow pop-ups in the browser if prompted.
4. Use the browser's print dialog to print the label.

The printable label includes:

- HoneyChain branding
- Honey type
- Batch ID
- Harvest date
- Quantity
- Apiary location
- Source hive ID
- QR code
- A scan-to-verify message

## 7. Public Honey Verification

HoneyChain provides a public verification page that does not require users to log in.

**Verification Page:** https://honeychainapito.netlify.app/verify

Consumers can access this page directly or scan the QR code printed on a honey label.

### 7.1 Verifying a Batch Using Its ID

1. Open the public verification page.
2. Enter the batch ID printed on the honey packaging.
3. Select **Verify Batch**.
4. Wait for the verification result.

The application retrieves the batch's public traceability information.

### 7.2 Verifying Through a QR Code

1. Open the camera or QR scanner on a mobile device.
2. Scan the QR code printed on the honey label.
3. Open the verification URL.
4. The application automatically retrieves the corresponding batch information.

### 7.3 Understanding Verification Results

The verification page displays whether blockchain verification was successful.

It also provides two hash-comparison results:

- **MongoDB Hash Match:** Indicates whether the calculated batch hash matches the hash stored in the database.
- **Blockchain Hash Match:** Indicates whether the submitted batch hash matches the hash recorded in the smart contract.

Both comparisons help establish whether the recorded batch metadata matches the expected data.

### 7.4 Batch Traceability Information

The public verification page displays:

- Batch ID
- Honey type
- Harvest date
- Harvest quantity
- Apiary location
- Source hive ID and name
- Bee type
- Hive location
- Processing date
- Packaging date
- Batch status
- Recorded status history
- Blockchain verification information

The traceability timeline presents recorded status changes and blockchain verification activity, including available dates and user information.

### 7.5 Blockchain Record Details

The blockchain section provides technical information such as:

- Blockchain network
- Smart contract address
- Transaction hash
- Calculated data hash
- Stored MongoDB hash
- On-chain contract hash
- Blockchain recording time

These details allow users to inspect the blockchain record associated with a honey batch.

**Important:** Blockchain verification confirms that the recorded batch metadata matches the hash stored in the smart contract. It does not independently certify honey purity, quality or physical origin.

## 8. Application Navigation

The authenticated application provides the following main navigation sections:

| Section | Purpose |
|---|---|
| Overview | View dashboard statistics and recent activity |
| Hive Management | Register, search, edit and deactivate hives |
| Honey Batches | Create batches, track statuses and generate QR codes |

The public verification page is accessible without authentication.

## 9. Troubleshooting

### Unable to Register or Log In

- Check that the email address is entered correctly.
- Ensure the password meets the minimum length requirement during registration.
- Check your internet connection.
- Try again if the server temporarily fails to respond.

### Unable to Create a Honey Batch

- Ensure at least one active hive exists.
- Check that all required fields are completed.
- Verify that the quantity is within the permitted range.
- Ensure the harvest date is not in the future.
- Check whether the Batch ID is already registered.

### QR Code Generation Fails

- Check your internet connection.
- Try generating the QR code again.
- Ensure the selected batch exists.

### Batch Verification Fails

- Check that the entered Batch ID is correct.
- Ensure the QR code belongs to a registered batch.
- If the batch is not found, verify the ID printed on the packaging.
- If blockchain verification fails, inspect the displayed verification details.

## 10. Conclusion

HoneyChain provides a unified platform for hive management, honey batch registration and blockchain-based traceability.

Through hive records, batch status tracking, QR-code generation and public verification, the platform helps make honey production information more accessible and transparent.

Its blockchain integration provides a way to check the integrity of recorded batch metadata, supporting greater transparency throughout the honey traceability process.