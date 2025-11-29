'use client'

import { firestore } from '../firebase'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SearchIcon from '@mui/icons-material/Search'
import InventoryIcon from '@mui/icons-material/Inventory'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Modal,
  Stack,
  TextField,
  Toolbar,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Card,
  CardContent,
  Chip,
  Fade,
  InputAdornment,
  Paper
} from '@mui/material'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc
} from 'firebase/firestore'
import { useEffect, useState, useMemo } from 'react'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
    }
  }, [])

  // Create theme based on darkMode state
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#6366f1' : '#4f46e5',
            light: darkMode ? '#818cf8' : '#6366f1',
            dark: darkMode ? '#4f46e5' : '#4338ca',
          },
          secondary: {
            main: darkMode ? '#ec4899' : '#db2777',
            light: darkMode ? '#f472b6' : '#ec4899',
            dark: darkMode ? '#db2777' : '#be185d',
          },
          background: {
            default: darkMode ? '#0f172a' : '#f8fafc',
            paper: darkMode ? '#1e293b' : '#ffffff',
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                padding: '10px 24px',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                },
              },
            },
          },
        },
      }),
    [darkMode]
  )

  // Save theme preference to localStorage
  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: darkMode 
      ? '0 20px 60px rgba(0, 0, 0, 0.5)' 
      : '0 20px 60px rgba(0, 0, 0, 0.2)',
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    outline: 'none',
  }

  // Define the updateInventory function inside the component
  const updateInventory = async () => {
    try {
      console.log('Fetching inventory from Firestore...')
      const inventoryCollection = collection(firestore, 'inventory')
      const docs = await getDocs(inventoryCollection)
      const inventoryList = []
      docs.forEach((doc) => {
        const data = doc.data()
        // Use the stored name if available, otherwise use the document ID
        inventoryList.push({ 
          id: doc.id,
          name: data.name || doc.id, 
          quantity: data.quantity || 1
        })
      })
      console.log('Fetched inventory items:', inventoryList)
      setInventory(inventoryList)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      alert('Error loading inventory: ' + error.message)
    }
  }

  // Use useEffect to run updateInventory when the component mounts
  useEffect(() => {
    console.log('Component mounted, initializing Firebase connection...')
    console.log('Firestore instance:', firestore)
    updateInventory()
  }, [])

  const addItem = async (item) => {
    try {
      if (!item || item.trim() === '') {
        alert('Please enter an item name')
        return
      }
      
      // Sanitize item name for Firestore document ID (replace spaces and special chars)
      const sanitizedItemName = item.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
      
      console.log('Adding item:', item, 'as document ID:', sanitizedItemName)
      
      const docRef = doc(collection(firestore, 'inventory'), sanitizedItemName)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        console.log('Item exists, updating quantity from', quantity, 'to', quantity + 1)
        await setDoc(docRef, { quantity: quantity + 1, name: item.trim() })
      } else {
        console.log('Creating new item with quantity 1')
        await setDoc(docRef, { quantity: 1, name: item.trim() })
      }
      
      console.log('Item added successfully, refreshing inventory...')
      await updateInventory()
      console.log('Inventory refreshed')
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Error adding item: ' + error.message)
    }
  }

  const removeItem = async (item) => {
    try {
      // Find the item by name to get its document ID
      const itemToRemove = inventory.find(inv => inv.name === item || inv.id === item)
      if (!itemToRemove) {
        console.error('Item not found:', item)
        return
      }
      
      const docRef = doc(collection(firestore, 'inventory'), itemToRemove.id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, { quantity: quantity - 1, name: itemToRemove.name })
        }
      }
      await updateInventory()
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Error removing item: ' + error.message)
    }
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={3}
        sx={{
          padding: 0,
          margin: 0,
          background: darkMode
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
            : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
          minHeight: '100vh',
          paddingBottom: 4,
        }}
      >
        {/* AppBar for the Inventory Management title */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            width: '100%',
            background: darkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            padding: { xs: 1, sm: 2 },
            marginBottom: 3,
            boxShadow: darkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(79, 70, 229, 0.2)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography
              variant="h4"
              component="div"
              sx={{ 
                flexGrow: 1, 
                textAlign: 'center',
                fontWeight: 700,
                background: darkMode
                  ? 'linear-gradient(45deg, #ffffff 30%, #e0e7ff 90%)'
                  : 'linear-gradient(45deg, #ffffff 30%, #f0f9ff 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Inventory Management
            </Typography>
            <IconButton
              onClick={toggleTheme}
              sx={{ 
                color: 'inherit',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(20deg) scale(1.1)',
                },
              }}
              aria-label="toggle theme"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

      {/* Search bar */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '900px',
          p: { xs: 1.5, sm: 2 },
          mx: { xs: 2, sm: 0 },
          background: darkMode
            ? 'rgba(30, 41, 59, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        <TextField
          label="Search Items"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 1)',
              },
              '&.Mui-focused': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)',
              },
            },
          }}
        />
      </Paper>

      {/* Inventory list with scrolling */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: { xs: '55vh', sm: '65vh' },
          mx: { xs: 2, sm: 0 },
          display: 'flex',
          flexDirection: 'column',
          background: darkMode
            ? 'rgba(30, 41, 59, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkMode 
                ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%)'
                : 'linear-gradient(180deg, rgba(79, 70, 229, 0.5) 0%, rgba(99, 102, 241, 0.5) 100%)',
              borderRadius: '10px',
              '&:hover': {
                background: darkMode 
                  ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.7) 0%, rgba(139, 92, 246, 0.7) 100%)'
                  : 'linear-gradient(180deg, rgba(79, 70, 229, 0.7) 0%, rgba(99, 102, 241, 0.7) 100%)',
              },
            },
          }}
        >
          <Stack width="100%" spacing={2} sx={{ padding: { xs: 2, sm: 3 } }}>
            {filteredInventory.length === 0 ? (
              <Fade in={true}>
                <Box
                  width="100%"
                  minHeight="200px"
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  gap={2}
                >
                  <InventoryIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant={'h6'} color={'text.secondary'} textAlign={'center'}>
                    No items in inventory
                  </Typography>
                  <Typography variant={'body2'} color={'text.secondary'} textAlign={'center'}>
                    Add an item to get started!
                  </Typography>
                </Box>
              </Fade>
            ) : (
              filteredInventory.map(({ name, quantity, id }, index) => (
                <Fade in={true} key={id || name} timeout={300 + index * 50}>
                  <Card
                    elevation={0}
                    sx={{
                      background: darkMode
                        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                      border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: darkMode
                          ? '0 12px 24px rgba(99, 102, 241, 0.2)'
                          : '0 12px 24px rgba(79, 70, 229, 0.15)',
                        borderColor: darkMode ? 'rgba(99, 102, 241, 0.5)' : 'rgba(79, 70, 229, 0.3)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        gap={2}
                        flexWrap="wrap"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                      >
                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
                          <Typography 
                            variant={'h5'} 
                            color={'text.primary'} 
                            sx={{ 
                              fontWeight: 600,
                              mb: 0.5,
                              fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            }}
                          >
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                          </Typography>
                        </Box>
                        <Chip
                          label={`Qty: ${quantity}`}
                          color="primary"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            height: '36px',
                            px: 1,
                          }}
                        />
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => removeItem(name)}
                          startIcon={<RemoveIcon />}
                          sx={{
                            minWidth: { xs: '100px', sm: '120px' },
                            width: { xs: '100%', sm: 'auto' },
                            mt: { xs: 1, sm: 0 },
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              ))
            )}
          </Stack>
        </Box>
      </Paper>

      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        size="large"
        sx={{ 
          marginTop: 3,
          padding: '14px 32px',
          fontSize: '1.1rem',
          boxShadow: darkMode
            ? '0 8px 16px rgba(99, 102, 241, 0.3)'
            : '0 8px 16px rgba(79, 70, 229, 0.25)',
        }}
        startIcon={<AddIcon />}
      >
        Add New Item
      </Button>

      {/* Modal for adding new items */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        closeAfterTransition
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AddIcon color="primary" />
              <Typography 
                id="modal-modal-title" 
                variant="h5" 
                component="h2"
                sx={{ fontWeight: 700 }}
              >
                Add New Item
              </Typography>
            </Box>
            <Stack width="100%" spacing={3}>
              <TextField
                id="outlined-basic"
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && itemName.trim()) {
                    addItem(itemName).then(() => {
                      setItemName('')
                      handleClose()
                    })
                  }
                }}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Stack direction={'row'} spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  sx={{ minWidth: '100px' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    await addItem(itemName)
                    setItemName('')
                    handleClose()
                  }}
                  disabled={!itemName.trim()}
                  startIcon={<AddIcon />}
                  sx={{ minWidth: '120px' }}
                >
                  Add Item
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </Box>
    </ThemeProvider>
  )
}
