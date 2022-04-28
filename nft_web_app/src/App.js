// src/App.js
import React, {useState, useEffect} from "react";
import {InjectedConnector} from "@web3-react/injected-connector";
import {useWeb3React} from "@web3-react/core";
import web3 from "./web3";
import Nft from "./Nft";
import {
    Button,
    Col,
    Row,
    Modal,
    Card,
    Container,
    Form,
    Nav,
    Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowRotateRight,
    faHammer,
    faImage,
    faImages,
} from "@fortawesome/free-solid-svg-icons";
import {faEthereum} from "@fortawesome/free-brands-svg-icons";
import "./style.css"

const App = () => {
    useEffect(() => {
        getOwnNfts();
        setOwnList(true);
        setCurrentListName("own");
        connect().then(() => {
            getBalance();
        });
        document.title = "NFT Application";
        //getAllNfts();
    }, []);

    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42],
    });

    const {account, activate} = useWeb3React();

    const [ownNftList, setOwnNftList] = useState([]);

    const [allNftList, setAllNftList] = useState([]);

    const [resultNftList, setResultNftList] = useState([]);

    const [tokenDetail, setTokenDetail] = useState([]);

    const [balance, setBalance] = useState("");

    const [targetAddress, setTargetAddress] = useState([]);

    const [targetId, setTargetId] = useState("");

    const [targetQuery1, setTargetQuery1] = useState("");

    const [targetQuery2, setTargetQuery2] = useState("");

    const [targetQuery3, setTargetQuery3] = useState("");

    const [currentTokenID, setCurrentTokenID] = useState("");

    const [currentListName, setCurrentListName] = useState("");

    const [modalShow, setModalShow] = React.useState(false);

    const [loadingShow, setLoadingShow] = useState(false);

    const [lgShow, setLgShow] = useState(false);

    const [ownListShow, setOwnList] = React.useState(false);

    const [allListShow, setAllList] = React.useState(false);

    const [resultListShow, setResultList] = React.useState(false);

    const [loadingMessage, setLoadingMessage] = React.useState("");

    const [showSuccess, setShowSuccess] = React.useState(false);

    const [showError, setShowError] = React.useState(false);

    const  IPFSGateWay="https://cloudflare-ipfs.com/ipfs/"

    const getBalance = async () => {
        const accounts = await web3.eth.getAccounts();
        if (!accounts[0]) {
            connect();
        }
        await web3.eth
            .getBalance(accounts[0])
            .then(function (result) {
                let ethBalance = web3.utils.fromWei(result, "ether");
                setBalance(Number(ethBalance).toFixed(4).toString() + " ETH");
            })
            .catch(function (e) {

            });
    };

    const getOwnNfts = async () => {
        setLoadingMessage("loading...");
        setLoadingShow(true);
        const contract = Nft;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        if (!accounts[0]) {
            connect();
        }
        contract.defaultAccount = account;
        const nftBalance = await contract.methods.balanceOf(account).call();
        let data = [];
        for (let i = 0; i < nftBalance; i++) {
            const tokenID = await contract.methods
                .tokenOfOwnerByIndex(account, i)
                .call();
            let tokenMetadataURI = await contract.methods.tokenURI(tokenID).call();
            if (tokenMetadataURI.startsWith("ipfs://")) {
                tokenMetadataURI = `${IPFSGateWay}${
                    tokenMetadataURI.split("ipfs://")[1]
                }`;
            }
            const tokenMetadata = await fetch(tokenMetadataURI).then((response) =>
                response.json()
            );
            data.push({
                tokenID: tokenID,
                name: tokenMetadata["name"],
                image: tokenMetadata["image"],
                attributes: tokenMetadata["attributes"],
            });
            setLoadingMessage("loading...(" + (i + 1).toString() + "/" + nftBalance.toString() + ")");
            setOwnNftList(data);
        }
        setLoadingShow(false);
    };

    const getAllNfts = async () => {
        setLoadingMessage("loading...");
        setLoadingShow(true);
        const contract = Nft;
        let data = [];
        let i = 0;
        let totalSupply = await contract.methods.totalSupply().call();
        for (let i = 0; i < totalSupply; i++) {

            const tokenID = await contract.methods.tokenByIndex(i).call();
            let tokenMetadataURI = await contract.methods.tokenURI(tokenID).call();
            if (tokenMetadataURI.startsWith("ipfs://")) {
                tokenMetadataURI = `${IPFSGateWay}${
                    tokenMetadataURI.split("ipfs://")[1]
                }`;
            }
            const tokenMetadata = await fetch(tokenMetadataURI).then((response) =>
                response.json()
            );
            data.push({
                tokenID: tokenID,
                name: tokenMetadata["name"],
                image: tokenMetadata["image"],
                attributes: tokenMetadata["attributes"],
            });
            setAllNftList(data);
            setLoadingMessage("loading...(" + (i + 1).toString() + "/" + totalSupply.toString() + ")");
        }
        setLoadingShow(false);
    };

    const transferFrom = async () => {
        try {
            const contract = Nft;
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            if (!accounts[0]) {
                connect();
            }
            contract.defaultAccount = account;
            const result = await contract.methods
                .safeTransferFrom(account, targetAddress, currentTokenID)
                .send({
                    from: accounts[0],
                });
            setShowError(false)
            setShowSuccess(true);
        } catch (e) {
            setShowSuccess(false)
            setShowError(true)
        }
    };

    const connect = async () => {
        try {
            await activate(injected);
        } catch (e) {
        }
    };

    const mint = async () => {
        try {
            const accounts = await web3.eth.getAccounts();
            if (!accounts[0]) {
                connect();
            }
            const result = await Nft.methods.mintPLP(1).send({
                from: accounts[0],
                value: web3.utils.toWei("0.00128", "ether"),
            });
            setShowError(false)
            setShowSuccess(true);
        } catch (e) {
            setShowSuccess(false)
            setShowError(true)
        }
    };

    const modalData = async (tokenID) => {
        setCurrentTokenID(tokenID);
        setModalShow(true);
    };

    const closeModal = () => {
        setModalShow(false);
    };

    const showOwnList = () => {
        setCurrentListName("own");
        setAllList(false);
        setResultList(false);
        getOwnNfts();
        setOwnList(true);
    };

    const showAllList = () => {
        setCurrentListName("all");
        setOwnList(false);
        setResultList(false);
        getAllNfts();
        setAllList(true);
    };

    const reload = () => {
        setTargetId("");
        setTargetQuery1("");
        setTargetQuery2("");
        setTargetQuery3("");
        setResultList(false);
        if (currentListName == "own") {
            getOwnNfts();
            setOwnList(true);
        } else if (currentListName == "all") {
            getAllNfts();
            setAllList(true);
        }
    };

    const tokenDetailShow = async (tokenId) => {
        let currentList = [];
        if (currentListName === "own") {
            currentList = ownNftList;
        }
        if (currentListName === "all") {
            currentList = allNftList;
        }
        const contract = Nft;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        let owner = await contract.methods.ownerOf(tokenId).call();
        if (account === owner) {
            owner = "You";
        }
        let data = [];
        for (let i = 0; i < currentList.length; i++) {
            if (tokenId === currentList[i].tokenID) {
                let plane = currentList[i]["attributes"][0].value;
                let line = currentList[i]["attributes"][1].value;
                let point = currentList[i]["attributes"][2].value;
                data = {
                    tokenID: currentList[i].tokenID,
                    name: currentList[i]["name"],
                    image: currentList[i]["image"],
                    plane: plane,
                    line: line,
                    point: point,
                    planeImage: require("./images/planes/" + plane + ".png"),
                    lineImage: require("./images/lines/" + line + ".png"),
                    pointImage: require("./images/points/" + point + ".png"),
                    owner: owner,
                };
                setTokenDetail(data);
            }
        }
        setLgShow(true);
    };

    const filter = () => {
        let data = [];
        let currentList;
        setResultNftList(data);
        let counter = 0;
        if (currentListName === "own") {
            currentList = ownNftList;
        }
        if (currentListName === "all") {
            currentList = allNftList;
        }
        for (let i = 0; i < currentList.length; i++) {
            counter = 0;
            if (currentList[i].tokenID === targetId || targetId === "") {
                counter += 1;
            }
            if (
                currentList[i].attributes[0].value === targetQuery1 ||
                targetQuery1 === ""
            ) {
                counter += 1;
            }
            if (
                currentList[i].attributes[1].value === targetQuery2 ||
                targetQuery2 === ""
            ) {
                counter += 1;
            }
            if (
                currentList[i].attributes[2].value === targetQuery3 ||
                targetQuery3 === ""
            ) {
                counter += 1;
            }
            if (counter === 4) {
                data.push({
                    tokenID: currentList[i].tokenID,
                    name: currentList[i].name,
                    image: currentList[i].image,
                    attributes: currentList[i].attributes,
                });
                setResultNftList(data);
            }
        }
        setResultList(true);
        setAllList(false);
        setOwnList(false);
    };

    return (

        <Container>
            <Alert style={{zIndex: '999999', position: "absolute", left: "50%", transform: 'translate(-50%)'}}
                   show={showSuccess} variant="success"
                   onClose={() => setShowSuccess(false)} dismissible>
                <Alert.Heading>Successful operation</Alert.Heading>
                <div className="d-flex justify-content-end">
                </div>
            </Alert>

            <Alert style={{zIndex: '999999', position: "absolute", left: "50%", transform: 'translate(-50%)'}}
                   show={showError} variant="danger"
                   onClose={() => setShowError(false)} dismissible>
                <Alert.Heading>Operation failed</Alert.Heading>
            </Alert>

            <h1
                style={{textAlign: "center", fontFamily: "monospace", marginTop: 30}}
            >
                NFT Application <FontAwesomeIcon icon={faEthereum}/>
            </h1>
            <div className="App">
                <div style={{margin: "auto", width: "50%"}}>
                    <p style={{textAlign: "center"}}>ETH Address: {account}</p>
                    <p style={{textAlign: "center"}}>Balance: {balance}</p>
                    <Row>
                        <Col style={{textAlign: "center"}}>
                            <Button variant="outline-success" onClick={connect}>
                                Connect to MetaMask
                            </Button>
                        </Col>
                        <Col style={{textAlign: "center"}}>
                            <Button variant="outline-primary" onClick={getBalance}>
                                Check Balance
                            </Button>
                        </Col>
                    </Row>
                </div>
                <br></br>
                <Nav fill variant="tabs" defaultActiveKey="link-1">
                    <Nav.Item>
                        <Nav.Link onClick={showOwnList} eventKey="link-1">
                            Colledted Item <FontAwesomeIcon icon={faImage}/>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link onClick={showAllList} eventKey="link-2">
                            All minted Item <FontAwesomeIcon icon={faImages}/>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link onClick={mint}>
                            Mint <FontAwesomeIcon icon={faHammer}/>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link onClick={reload}>
                            Reload
                            {loadingShow ?
                                <FontAwesomeIcon icon={faArrowRotateRight} className="loader"/> :
                                <FontAwesomeIcon icon={faArrowRotateRight}/>
                            }
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <br></br>
                <Form.Group>
                    <Row>
                        <Col md={4}>
                            <Form.Label>Target ID</Form.Label>
                            <Form.Control
                                style={{marginBottom: 30}}
                                type="text"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                placeholder="Token ID"
                                autoFocus
                            />
                        </Col>
                        <Col>
                            <Form.Label>Point</Form.Label>
                            <Form.Select value={targetQuery3} onChange={(e) => setTargetQuery3(e.target.value)}>
                                <option></option>
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8</option>
                                <option>9</option>
                                <option>10</option>
                                <option>11</option>
                                <option>12</option>
                                <option>13</option>
                                <option>14</option>
                                <option>15</option>
                                <option>16</option>
                                <option>17</option>
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Label>Line</Form.Label>
                            <Form.Select value={targetQuery2} onChange={(e) => setTargetQuery2(e.target.value)}>
                                <option></option>
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8</option>
                                <option>9</option>
                                <option>10</option>
                                <option>11</option>
                                <option>12</option>
                                <option>13</option>
                                <option>14</option>
                                <option>15</option>
                                <option>16</option>
                                <option>17</option>
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Label>Plane</Form.Label>
                            <Form.Select value={targetQuery1} onChange={(e) => setTargetQuery1(e.target.value)}>
                                <option></option>
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8</option>
                                <option>9</option>
                                <option>10</option>
                                <option>11</option>
                                <option>12</option>
                                <option>13</option>
                                <option>14</option>
                                <option>15</option>
                                <option>16</option>
                                <option>17</option>
                                <option>18</option>
                                <option>19</option>
                            </Form.Select>
                        </Col>
                        <Col className="justify-content-center">
                            <Button style={{marginTop: 30, marginBottom: 30}} onClick={filter}>
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Form.Group>
                <Container>
                    {loadingShow ?
                        <p style={{textAlign: "center"}}>{loadingMessage}</p> : null
                    }
                    <Row style={{display: ownListShow ? "flex" : "none"}}>
                        {ownNftList.map((nft, key) => (
                            <Col key={key} md={3} style={{marginBottom: 30}}>
                                <Card>
                                    <Card.Img variant="top" src={nft.image}/>
                                    <Card.Body style={{textAlign: "center"}}>
                                        <Card.Title>{nft.name}</Card.Title>

                                        <Button
                                            style={{margin: 10}}
                                            variant="warning"
                                            onClick={() => tokenDetailShow(nft.tokenID)}
                                        >
                                            Detail
                                        </Button>

                                        <Button
                                            style={{margin: 10}}
                                            variant="primary"
                                            onClick={() => modalData(nft.tokenID)}
                                        >
                                            transfer
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <Row style={{display: allListShow ? "flex" : "none"}}>
                        {allNftList.map((nft, key) => (
                            <Col key={key} md={3} style={{marginBottom: 30}}>
                                <Card>
                                    <Card.Img variant="top" src={nft.image}/>
                                    <Card.Body style={{textAlign: "center"}}>
                                        <Card.Title>{nft.name}</Card.Title>
                                        <Button
                                            style={{margin: 10}}
                                            variant="warning"
                                            onClick={() => tokenDetailShow(nft.tokenID)}
                                        >
                                            Detail
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <br/>
                    <Row style={{display: resultListShow ? "flex" : "none"}}>
                        {resultNftList.map((nft, key) => (
                            <Col key={key} md={3} style={{marginBottom: 30}}>
                                <Card>
                                    <Card.Img variant="top" src={nft.image}/>
                                    <Card.Body style={{textAlign: "center"}}>
                                        <Card.Title>{nft.name}</Card.Title>
                                        <Button
                                            style={{margin: 10}}
                                            variant="warning"
                                            onClick={() => tokenDetailShow(nft.tokenID)}
                                        >
                                            Detail
                                        </Button>
                                        <Button
                                            style={{
                                                margin: 10,
                                                display: currentListName == "own" ? "row" : "none",
                                            }}
                                            variant="primary"
                                            onClick={() => modalData(nft.tokenID)}
                                        >
                                            transfer
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <Modal
                        size="lg"
                        show={lgShow}
                        onHide={() => setLgShow(false)}
                        aria-labelledby="example-modal-sizes-title-lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="example-modal-sizes-title-lg">
                                {tokenDetail.name}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={6}>
                                    <a href={tokenDetail.image} target="_blank">
                                        <Card.Img variant="top" src={tokenDetail.image}/>
                                    </a>
                                </Col>
                                <Col md={6}>
                                    <h5>Owner</h5><br/>
                                    <div style={{marginBottom: 30}}><font size={2}>{tokenDetail.owner}</font></div>
                                    <h5>Feature</h5>
                                    <Row className="border-bottom border-top">
                                        <Col>
                                            <p>Point: {tokenDetail.point}</p>
                                        </Col>
                                        <Col>
                                            <Card.Img
                                                className="border"
                                                variant="top"
                                                src={tokenDetail.pointImage}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="border-bottom">
                                        <Col>
                                            <p>Line: {tokenDetail.line}</p>
                                        </Col>
                                        <Col>
                                            <Card.Img
                                                className="border"
                                                variant="top"
                                                src={tokenDetail.lineImage}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="border-bottom">
                                        <Col>
                                            <p>Plane: {tokenDetail.plane}</p>
                                        </Col>
                                        <Col>
                                            <Card.Img
                                                className="border"
                                                variant="top"
                                                src={tokenDetail.planeImage}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Modal.Body>
                    </Modal>
                </Container>
            </div>

            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={modalShow}
                onHide={closeModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Transfer Confirmation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <h4>Token Id : {currentTokenID}</h4>
                        <Form.Label>Enter the target address:</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(e) => setTargetAddress(e.target.value)}
                            placeholder="Target Address"
                            autoFocus
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={closeModal}>Close</Button>
                    <Button onClick={transferFrom}>Confirm transfer</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default App;