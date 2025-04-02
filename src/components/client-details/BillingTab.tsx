import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Stack,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Payments as BillingIcon,
  Add as AddIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  CheckCircle as PaidIcon,
  LocalOffer as DiscountIcon,
  EventNote as AppointmentIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  FilterAlt as FilterIcon,
  Email as EmailIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

interface BillingTabProps {
  billingRecords: any[];
  client: any;
}

export const BillingTab: React.FC<BillingTabProps> = ({ billingRecords, client }) => {
  const [showAddChargeDialog, setShowAddChargeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MM/dd/yyyy');
  };
  
  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${Math.abs(amount).toFixed(2)}`;
  };
  
  // Calculate account summary
  const totalCharges = billingRecords
    .filter(record => record.type !== 'payment')
    .reduce((sum, record) => sum + record.amount, 0);
    
  const totalPayments = billingRecords
    .filter(record => record.type === 'payment')
    .reduce((sum, record) => sum + Math.abs(record.amount), 0);
    
  const balance = totalCharges - totalPayments;
  
  // Filter records for different tables
  const pendingCharges = billingRecords.filter(
    record => record.type !== 'payment' && record.status === 'pending'
  );
  
  const recentActivity = [...billingRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const insuranceStatus = [
    { status: 'submitted', count: 0 },
    { status: 'approved', count: 0 },
    { status: 'denied', count: 0 },
    { status: 'not-submitted', count: 0 }
  ];
  
  // Count records by insurance status
  billingRecords.forEach(record => {
    const statusItem = insuranceStatus.find(item => item.status === record.insuranceStatus);
    if (statusItem) {
      statusItem.count++;
    }
  });
  
  const getStatusChip = (status: string) => {
    let color;
    let icon;
    let label = status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
    
    switch (status) {
      case 'paid':
        color = 'success';
        icon = <PaidIcon />;
        break;
      case 'pending':
        color = 'warning';
        icon = <MoneyIcon />;
        break;
      case 'waived':
        color = 'info';
        icon = <DiscountIcon />;
        break;
      case 'processed':
        color = 'success';
        icon = <CheckCircle />;
        break;
      case 'approved':
        color = 'success';
        icon = <CheckCircle />;
        break;
      case 'denied':
        color = 'error';
        icon = <CancelIcon />;
        break;
      case 'submitted':
        color = 'info';
        icon = <SendIcon />;
        break;
      default:
        color = 'default';
        icon = <BillingIcon />;
    }
    
    return (
      <Chip 
        label={label} 
        color={color as any}
        size="small"
        icon={icon}
        variant="outlined"
      />
    );
  };
  
  const AddChargeDialog = () => (
    <Dialog
      open={showAddChargeDialog}
      onClose={() => setShowAddChargeDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Add Charge
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              margin="normal"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                defaultValue="service"
              >
                <MenuItem value="service">Service</MenuItem>
                <MenuItem value="document">Document Fee</MenuItem>
                <MenuItem value="cancellation">Late Cancellation</MenuItem>
                <MenuItem value="other">Other Fee</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Description"
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>CPT Code (if applicable)</InputLabel>
              <Select
                label="CPT Code (if applicable)"
                defaultValue=""
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="90791">90791 - Initial Evaluation</MenuItem>
                <MenuItem value="90834">90834 - Psychotherapy, 45 min</MenuItem>
                <MenuItem value="90837">90837 - Psychotherapy, 60 min</MenuItem>
                <MenuItem value="90847">90847 - Family Therapy</MenuItem>
                <MenuItem value="90853">90853 - Group Therapy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Amount"
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Bill Insurance</InputLabel>
              <Select
                label="Bill Insurance"
                defaultValue="yes"
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAddChargeDialog(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setShowAddChargeDialog(false)}
        >
          Add Charge
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  const AddPaymentDialog = () => (
    <Dialog
      open={showPaymentDialog}
      onClose={() => setShowPaymentDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Record Payment
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              margin="normal"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Amount"
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select
                label="Payment Method"
                defaultValue="credit-card"
              >
                <MenuItem value="credit-card">Credit Card</MenuItem>
                <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="insurance">Insurance Payment</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Apply To</InputLabel>
              <Select
                label="Apply To"
                defaultValue="oldest"
              >
                <MenuItem value="oldest">Oldest Charges First</MenuItem>
                <MenuItem value="specific">Specific Invoices</MenuItem>
                <MenuItem value="account">Account Balance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Send Receipt</InputLabel>
              <Select
                label="Send Receipt"
                defaultValue="yes"
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowPaymentDialog(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setShowPaymentDialog(false)}
        >
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BillingIcon color="primary" />
              <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                Account Summary
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  startIcon={<MoneyIcon />}
                  onClick={() => setShowAddChargeDialog(true)}
                >
                  Add Charge
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<CreditCardIcon />}
                  onClick={() => setShowPaymentDialog(true)}
                >
                  Record Payment
                </Button>
              </Stack>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Current Balance
                    </Typography>
                    <Typography variant="h4" color={balance > 0 ? 'error.main' : 'success.main'}>
                      {formatCurrency(balance)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Charges
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(totalCharges)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Payments
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(totalPayments)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={8}>
          <Paper variant="outlined" sx={{ height: '100%' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="h3">
                Transaction History
              </Typography>
              <Button 
                variant="text" 
                size="small" 
                endIcon={<FilterIcon />}
              >
                Filter
              </Button>
            </Box>
            <Divider />
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="medium" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billingRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No billing records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    billingRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>
                          {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          {record.cptCode && ` (${record.cptCode})`}
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          color: record.type === 'payment' ? 'success.main' : 'inherit',
                          fontWeight: record.type === 'payment' ? 'bold' : 'normal'
                        }}>
                          {record.type === 'payment' ? `(${formatCurrency(Math.abs(record.amount))})` : formatCurrency(record.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusChip(record.status)}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View">
                            <IconButton size="small">
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {record.receiptSent ? (
                            <Tooltip title="Resend Receipt">
                              <IconButton size="small" color="primary">
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Send Receipt">
                              <IconButton size="small">
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" size="small">
                View All Transactions
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Insurance Claims
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {client.insuranceProvider ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {client.insuranceProvider}
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Submitted:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {insuranceStatus.find(s => s.status === 'submitted')?.count || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Approved:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {insuranceStatus.find(s => s.status === 'approved')?.count || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Denied:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {insuranceStatus.find(s => s.status === 'denied')?.count || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<ReceiptIcon />}
                    >
                      Submit Claim
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">
                  No insurance information on file.
                </Alert>
              )}
            </Box>
          </Paper>
          
          <Paper variant="outlined">
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={1}>
                <Button 
                  variant="outlined" 
                  startIcon={<PrintIcon />}
                  fullWidth
                >
                  Print Statement
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<EmailIcon />}
                  fullWidth
                >
                  Email Statement
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ReceiptIcon />}
                  fullWidth
                >
                  Generate Superbill
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  fullWidth
                >
                  Export Transactions
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
        
        {pendingCharges.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Pending Charges
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Insurance Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingCharges.map((charge) => (
                        <TableRow key={charge.id}>
                          <TableCell>{formatDate(charge.date)}</TableCell>
                          <TableCell>{charge.description}</TableCell>
                          <TableCell>{formatCurrency(charge.amount)}</TableCell>
                          <TableCell>{getStatusChip(charge.insuranceStatus)}</TableCell>
                          <TableCell align="right">
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<CreditCardIcon />}
                            >
                              Collect Payment
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      <AddChargeDialog />
      <AddPaymentDialog />
    </Box>
  );
}; 