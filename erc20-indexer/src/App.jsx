import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Stack,
  TableContainer
  
} from '@chakra-ui/react';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from '@chakra-ui/react';





import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState,useEffect } from 'react';

function App() {
  
  const [inputAddress, setInputAddress] = useState('');
  const [connectedWallet, setConnectedWallet] = useState('');

  useEffect(()=>{
    addWalletListener();
    //console.log("Listener: connected adderss in use " + connectedWallet);
  });

  useEffect(()=>{
    getCurrentWallet();
  //  console.log("current : input adderss in use " + inputAddress);

  });

  const handleAddressInput = (event) => {
    setInputAddress(event.target.value);
  };


  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);



  const connectWallet = async () => {
    console.log('Connecting wallet...');

    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setConnectedWallet(accounts[0]);
            console.log(accounts[0]);
        } catch (error) {
            console.error(error);
        }
    } else {
        console.log('Please install MetaMask!');
    }
};

const getCurrentWallet = async () => {

  if (window.ethereum) {
      try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if(accounts.length>0){
          setConnectedWallet(accounts[0]);
          //console.log(accounts[0]);
          }
          else{
            console.log("Connect Metamask using the connect buttom")
          }
      } catch (error) {
          console.error(error);
      }
  } else {
      console.log('Please install MetaMask!');
  }
};



async function getTokenBalance(address) {

  const config = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);


  if (!address) {
    console.log("No address provided");
    return;
  }
  let address_used=address;

  if (address.endsWith('.eth')){
    address_used= await alchemy.core.resolveName(address);
    if (!address_used) {
      console.log("Failed to resolve ENS name");
      return;
    }
  }
  

  // Clear out previous data before fetching new data
  setIsLoading(true);
  setResults([]);
  setTokenDataObjects([]);
  setHasQueried(false); // Reset the query status


  console.log("Address to get data: " + address_used);
  

  try {
    const data = await alchemy.core.getTokenBalances(address_used);
    setResults(data);

    const tokenDataResults = [];
    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = await alchemy.core.getTokenMetadata(data.tokenBalances[i].contractAddress);
      tokenDataResults.push(tokenData);
      console.log(tokenDataObjects);
    }

    setTokenDataObjects(tokenDataResults); // Update the state after the loop completes
    setHasQueried(true); // Indicate that the query has completed
  } catch (error) {
    console.error("Failed to fetch token balances:", error);
    // Handle any errors
  }

  finally {
  setIsLoading(false); // Stop loading regardless of the outcome
}
}

  const addWalletListener = async () => {

    if (window.ethereum) {
      window.ethereum.on("accountsChanged",(accounts)=>{
        setConnectedWallet(accounts[0]);
        console.log(accounts[0]);
      })
    } else {
      setConnectedWallet("");
      console.log("nothing is connected")
    }
};


  return (

    
    <Box h="100vh" w="100vw">
        <Stack direction='row' spacing={4} align='start' justify="end" my={20} mx={30}>
          <Button onClick={connectWallet}  variant="outline" bg="teal">
            {connectedWallet && connectedWallet.length > 0 
            ? `Connected: ${connectedWallet.substring(0,6)}...${connectedWallet.substring(38)} `
            :"Connect Wallet" } 
          </Button>

        <Button onClick={() => getTokenBalance(connectedWallet)} variant="outline" bg="teal">
          Check your Balances
        </Button>

        </Stack>


      <Center>
          <Flex
            alignItems={'center'}
            justifyContent="center"
            flexDirection={'column'}
          >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>

        <Flex
          w="full" // Set the width to full to take up all available horizontal space
          flexDirection="column"
          alignItems="center"
          justifyContent={'center'}
        >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          placeholder="Enter an address or connect your wallet"
          onChange={handleAddressInput}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={() => getTokenBalance(inputAddress)} mt={36} bgColor="grey">
          Check ERC-20 Token Balances
        </Button>

        <Heading my={36}>ERC-20 token balances:</Heading>
              
{isLoading ? (
  <Center>
    <Spinner     sx={{
      width: '50px', // You can use any size units like 'em', 'rem', 'px', etc.
      height: '50px',
      // You can also include other CSS properties here
    }} /> 
  </Center>
):

        hasQueried ? (

      <Table border="3px solid" sx={{ borderRadius: '1rem', }} >
      
        <Thead>
        <Tr>
          <Th width="200px" textAlign="center">Symbol</Th>
          <Th width="200px" textAlign="center">Balance</Th>
          <Th width="200px" textAlign="center">Logo</Th>
        </Tr>
        </Thead>
        <Tbody>
        {results.tokenBalances.map((e, i) => (
          <Tr key={e.id}>
            <Td textAlign="center" fontWeight="bold">{ tokenDataObjects[i].symbol}</Td>
            <Td textAlign="center">{ Number(Utils.formatUnits(e.tokenBalance, tokenDataObjects[i].decimals)).toFixed(2)}</Td>
            <Td><Center>
              <Image src={tokenDataObjects[i].logo} boxSize="30px" objectFit="cover" />
              </Center>
            </Td>
          </Tr>
        ))}
        </Tbody>
      </Table>

        ) : (
          'Please make a query! This may take a few seconds...'
        )}
      </Flex>
    </Box>

  );
}

export default App;
