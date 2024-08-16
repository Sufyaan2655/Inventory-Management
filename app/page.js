'use client'

import { firestore } from '@/firebase'
import AddIcon from '@mui/icons-material/Add'
import {
  AppBar,
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc
} from 'firebase/firestore'
import { useEffect, useState } from 'react'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')

  const [searchQuery, setSearchQuery] = useState('')

  // Define the updateInventory function inside the component
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  // Use useEffect to run updateInventory when the component mounts
  useEffect(() => {
    const items = collection(firestore, 'inventory')
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
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
        background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e4ec 100%)', // Light gradient background
      }}
    >
      {/* AppBar for the Inventory Management title */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#3f51b5',
          width: '100%',
          padding: 2,
          marginBottom: 2,
        }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography
            variant="h4"
            component="div"
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            Inventory Management
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Search bar */}
      <TextField
        label="Search Items"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{
          backgroundColor: '#e0f7fa',
          borderRadius: '5px',
          input: {
            color: '#00695c',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#00695c',
            },
            '&:hover fieldset': {
              borderColor: '#004d40',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#004d40',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#00695c',
          },
          maxWidth: '800px',
        }}
      />

      {/* Inventory list */}
      <Box
        border={'1px solid #333'}
        width="800px"
        mt={2}
        sx={{
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Stack width="100%" spacing={3} overflow={'auto'}>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="100px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
              sx={{
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f1f5 100%)',
              }}
            >
              <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => removeItem(name)}
                startIcon={<AddIcon />}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ marginTop: 2 }}
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
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
