import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { ChangeCircleRounded } from "@mui/icons-material";
import { useNavigate } from "react-router";

const tabs = ["Layout 1", "Layout 2", "Layout 3", "Layout 4"];

export const ResultPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const nav = useNavigate();


    return (
        <Box sx={{ boxSizing: 'border-box', height: '100%', width: '100dvw', display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Tabs Container */}
            <Box height='50px' width='100dvw' paddingLeft='40px'>
                <Box sx={{ display: "flex", position: "relative", height: '100%' }}>
                    <ChangeCircleRounded
                        color="success"
                        fontSize="large"
                        sx={{ position: "absolute", top: '2%', right: '30px', cursor: "pointer" }}
                        onClick={() => nav('/')}
                    />
                    {tabs.map((label, index) => (
                        <Box
                            key={index}
                            onClick={() => setActiveTab(index)}
                            sx={[(theme) => ({
                                position: "absolute",
                                height: '52px',
                                left: `${index * (100 + 6)}px`,
                                clipPath: "polygon(10% 23%, 90% 23%, 100% 77%, 0% 77%)",
                                backgroundColor: 'black',
                                transition: "all 0.3s ease",
                                width: 122,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: activeTab === index ? 1 : 0,
                                transform: activeTab === index ? "scale(1.05)" : "scale(1)",
                                boxShadow: "4px 4px 20px 5px rgba(0,0,0,0.1)",
                            })
                            ]}
                        >
                            <Box
                                key={index}
                                onClick={() => setActiveTab(index)}
                                sx={[(theme) => ({
                                    position: "relative",
                                    height: '50px',
                                    clipPath: "polygon(10% 23%, 90% 23%, 100% 77%, 0% 77%)",
                                    backgroundColor: activeTab === index ? "#fff" : `hsl(0, 0%, ${68 + index * 8}%)`,
                                    color: theme.palette.text.primary,
                                    cursor: "pointer",
                                    textAlign: "center",
                                    fontSize: 13,
                                    fontWeight: activeTab === index ? "bold" : "normal",
                                    width: 120,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                })
                                ]}
                            >
                                {label}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box
                sx={[(theme) => ({
                    border: `1px solid ${theme.palette.text.primary}`,
                    width: "98%",
                    minHeight: '93%',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    borderRadius: "5px",
                    padding: 3,
                    marginTop: '-12px',
                    boxShadow: "4px 4px 20px 10px rgba(0,0,0,0.1)",
                    backgroundColor: `${theme.palette.background.paper}`,
                    zIndex: 10,
                })]}
            >
                <Typography variant="h6">Content for {tabs[activeTab]}</Typography>
            </Box>
        </Box>
    );
};
