from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, List

class Trait(BaseModel):
    model_config = ConfigDict(extra='forbid') # Don't change to camel case must be snake
    traitName: str
    phenotype: str
    dominanceExpression: str = Field(description="May ONLY input dominant or recessive. Complete/Incomplete/Codominance is for a different field, DO NOT PUT THAT HERE.")
    dominanceType: Literal["Complete Dominance", "Incomplete Dominance", "Codominance"]

    genotype: str = Field(description="The Mendelian letters representing the alleles (ex:aa, Aa). If the 2nd allele cannot be determined from its phenotype, put an underscore (ex: A_).")

class Organism(BaseModel):
    model_config = ConfigDict(extra='forbid')
    commonName: str
    scientificName: str
    traits: List[Trait] = Field(description="Choose traits that can be visually seen and are simple Mendelian traits. Absolutely NO polygenic traits.")

class AnalysisResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')
    organisms: List[Organism] = Field(description="The organisms that can be seen in the image.")