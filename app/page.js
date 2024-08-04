'use client'
import { Typography, Button, Modal, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, getDoc, query, setDoc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
// import { OpenAI } from 'openai'

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
};

// const openAI = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY });

/*const getRecipeSuggestions = async (pantry) => {
  const pantryItems = pantry.map(({ name, count }) => `${name}: ${count}`).join(", ");
  const completion = await openAI.chat.completions.create({
    messages: [{ role: "system", content: `Given the following pantry items: ${pantryItems}, suggest some recipes.` }],
    model: "gpt-4o-mini",
  });

  return (completion.data.choices[0].text);
}*/

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [removeItemName, setRemoveItemName] = useState('');
  const [removeQuantity, setRemoveQuantity] = useState(1);
  const [addItemName, setAddItemName] = useState('');
  const [addQuantity, setAddQuantity] = useState(1);
  const [itemName, setItemName] = useState('');
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false)
  const handleOpenNewModal = () => setOpenNewModal(true);
  const [itemQuantity, setItemQuantity] = useState(1);
  //const [openRecipeModal, setOpenRecipeModal] = useState(false);
  //const [recipeSuggestions, setRecipeSuggestions] = useState('');
  const handleCloseNewModal = () => setOpenNewModal(false);
  const handleOpenRemoveModal = (name) => {
    setRemoveItemName(name);
    setOpenRemoveModal(true);
  };
  const handleCloseRemoveModal = () => setOpenRemoveModal(false);
  const handleOpenAddModal = (name) => {
    setAddItemName(name);
    setOpenAddModal(true);
  }
  const handleCloseAddModal = () => setOpenAddModal(false);
  /*const handleOpenRecipeModal = async () => {
    const suggestions = await getRecipeSuggestions(pantry);
    setRecipeSuggestions(suggestions);
    setOpenRecipeModal(true);
  };
  const handleCloseRecipeModal = () => setOpenRecipeModal(false);*/

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({"name": doc.id, "count": doc.data().count});
    })
    console.log(pantryList);
    setPantry(pantryList);
  }

  useEffect( () => {
    updatePantry()
  }, [])

  const newItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    // Check if exists
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count + quantity})
    } else {
        await setDoc(docRef, {count: quantity})
    }
    await updatePantry()
  }

  const removeItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      const newCount = count - quantity
      if(newCount <= 0){
        await deleteDoc(docRef)
      }
      else {
        await setDoc(docRef, {count: count - quantity})
      }
    }
    await updatePantry()
  }

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count + quantity})
    }
    await updatePantry()
  }

  return (
    <Box 
    width="100vw" 
    height="100vh" 
    display={"flex"} 
    justifyContent={"center"} 
    flexDirection={'column'}
    alignItems={"center"}
    gap={2}
    >
      <Box
      border={'1px solid #333'}
      >

      <Box
      width='800px'
      height='100px'
      bgcolor={'#ADD8E6'}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      >
        <Typography
        variant={'h2'}
        color={'#333'}
        textAlign={'center'}
        >
          Pantry Items
        </Typography>
      </Box>
      <Stack
      width="800px"
      height="300px"
      spacing={2}
      overflow={"auto"}
      >
        {pantry.map(({name, count}) => (
          //<Stack
          //key={i}
          //direction={'row'}
          //spacing={2}
          //justifyContent={'center'}
          //alignContent={'space-between'}
          //>
            <Box
            key={name}
            width="100%"
            minHeight="150px"
            display={"flex"}
            justifyContent={'space-between'}
            alignItems={'space-between'}
            bgcolor={'#f0f0f0'}
            paddingX={5}
            >
              <Typography
              variant={'h3'}
              color={'#333'}
              textAlign={'center'}
              >
                {
                  // Capitalize the first letter of the item
                  name.charAt(0).toUpperCase() + name.slice(1)
                }
              </Typography>
              <Typography
                variant={'h3'}
                color={'#333'}
                textAlign={'center'}
              >
                {count}
              </Typography>
            <Button
            variant="contained"
            onClick={ () => {
              handleOpenAddModal(name)
            }}
            >
              Add
            </Button>
            <Button
            variant="contained"
            onClick={ () =>{
              handleOpenRemoveModal(name)
            }}
            >
              Remove
            </Button>
            </Box>
          //</Stack>
        ))}
      </Stack>
      </Box>
      <Button variant="contained" onClick={handleOpenNewModal}>New Item</Button>
      <Modal
        open={openNewModal}
        onClose={handleCloseNewModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            New Item
          </Typography>
          <Stack
          width="100%"
          direction={'row'}
          spacing={2}
          >
            <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value))}
            />
            <Button
            variant="outlined"
            onClick={ () =>{
              newItem(itemName, itemQuantity)
              setItemName('')
              setItemQuantity(1)
              handleCloseNewModal()
            }}
            >
              Add
            </Button>
            {/*
            <Button
            variant="contained"
            onClick={handleOpenRecipeModal}
            >
              Get Recipes
            </Button>*/}
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={openRemoveModal}
        onClose={handleCloseRemoveModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Remove Item
          </Typography>
          <Stack
          width="100%"
          direction={'row'}
          spacing={2}
          >
            <TextField
            id="outlined-basic"
            label="Number To Remove"
            variant="outlined"
            type="number"
            fullWidth
            value={removeQuantity}
            onChange={(e) => setRemoveQuantity(parseInt(e.target.value))}
            />
            <Button
            variant="outlined"
            onClick={ () =>{
              removeItem(removeItemName, removeQuantity)
              setRemoveQuantity(1)
              handleCloseRemoveModal()
            }}
            >
              Remove
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={openAddModal}
        onClose={handleCloseAddModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack
          width="100%"
          direction={'row'}
          spacing={2}
          >
            <TextField
            id="outlined-basic"
            label="Number to Add"
            variant="outlined"
            type="number"
            fullWidth
            value={addQuantity}
            onChange={(e) => setAddQuantity(parseInt(e.target.value))}
            />
            <Button
            variant="outlined"
            onClick={ () =>{
              addItem(addItemName, addQuantity)
              setAddQuantity(1)
              handleCloseAddModal()
            }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/*
      <Modal
        open={openRecipeModal}
        onClose={handleCloseRecipeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Recipe Suggestions
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {recipeSuggestions}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleCloseRecipeModal}
          >
            Close
          </Button>
        </Box>
      </Modal>*/}     
    </Box>
  );
}